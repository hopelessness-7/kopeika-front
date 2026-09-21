<template>
  <div v-if="items.length" class="dashboard-reminders">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="dashboard-reminders__item"
      :class="'dashboard-reminders__item--' + item.kind"
    >
      <q-icon :name="item.icon" size="18px" />
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormatMoney } from 'src/composables/useFormatMoney'

const props = defineProps({
  data: { type: Object, required: true }
})

const { formatMoney } = useFormatMoney()

const items = computed(() => {
  if (!props.data || props.data.notification_mode === 'quiet') {
    return []
  }

  const list = []
  const paymentsOnly = props.data.notification_mode === 'payments_only'

  if (!paymentsOnly && props.data.check_in_due) {
    list.push({
      kind: 'checkin',
      icon: 'fact_check',
      text: 'Пора уточнить баланс — это займёт 30 секунд'
    })
  }

  const next = props.data.next_obligation
  if (next && next.days_until <= 3) {
    list.push({
      kind: 'payment',
      icon: 'event',
      text: `Платёж «${next.title}» через ${next.days_until} дн. — ${formatMoney(next.amount)}`
    })
  }

  if (!paymentsOnly && (props.data.zone === 'yellow' || props.data.zone === 'red')) {
    list.push({
      kind: 'zone',
      icon: 'warning',
      text: props.data.zone === 'red'
        ? 'Запас на счёте критически мал'
        : 'Запас тонкий — имеет смысл сдержать траты'
    })
  }

  return list
})
</script>

<style scoped lang="scss">
.dashboard-reminders {
  display: grid;
  gap: var(--k-space-2);
  margin-bottom: var(--k-space-3);
}

.dashboard-reminders__item {
  display: flex;
  align-items: flex-start;
  gap: var(--k-space-2);
  padding: var(--k-space-3);
  border-radius: var(--k-radius-md);
  font-size: 0.875rem;
  line-height: 1.4;

  &--checkin {
    background: rgba(79, 70, 229, 0.08);
    color: var(--k-text);
  }

  &--payment {
    background: rgba(244, 63, 94, 0.08);
  }

  &--zone {
    background: rgba(245, 158, 11, 0.1);
  }
}
</style>
