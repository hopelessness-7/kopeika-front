<template>
  <component
    :is="link ? 'router-link' : 'div'"
    :to="link ? `/obligations/${obligation.id}` : undefined"
    class="k-obligation"
    :class="{ 'k-obligation--inactive': !obligation.is_active }"
  >
    <div class="k-obligation__icon">
      <q-icon :name="typeIcon" size="24px" />
    </div>
    <div class="k-obligation__body">
      <div class="k-obligation__title">{{ obligation.title }}</div>
      <span class="k-obligation__type">{{ typeLabel }}</span>
      <div class="k-obligation__amount">
        {{ formatMoney(obligation.payment_amount) }}/мес · {{ obligation.payment_day }}-е число
      </div>
      <div v-if="hasProgress" class="k-obligation__progress">
        <div class="k-obligation__progress-row">
          <span>Погашено {{ obligation.progress_percent }}%</span>
          <span v-if="obligation.remaining_amount != null">
            остаток {{ formatMoney(obligation.remaining_amount) }}
          </span>
        </div>
        <q-linear-progress
          :value="obligation.progress_percent / 100"
          size="6px"
          rounded
          color="primary"
          track-color="grey-3"
        />
      </div>
      <div v-else-if="obligation.remaining_amount" class="k-obligation__remain">
        Остаток {{ formatMoney(obligation.remaining_amount) }}
      </div>
      <div v-if="obligation.needs_close" class="k-obligation__status k-obligation__status--warn">
        Можно закрыть
      </div>
      <div v-else-if="!obligation.is_active" class="k-obligation__status">Закрыто</div>
    </div>
    <q-btn flat round dense icon="more_vert" color="grey-7" @click.stop.prevent>
      <q-menu class="k-card" anchor="bottom right" self="top right">
        <q-list style="min-width: 180px">
          <q-item v-close-popup clickable :to="`/obligations/${obligation.id}`">
            <q-item-section avatar>
              <q-icon name="visibility" size="20px" />
            </q-item-section>
            <q-item-section>Открыть</q-item-section>
          </q-item>
          <q-item v-close-popup clickable :to="`/obligations/${obligation.id}/edit`">
            <q-item-section avatar>
              <q-icon name="edit" size="20px" />
            </q-item-section>
            <q-item-section>Редактировать</q-item-section>
          </q-item>
          <q-item v-close-popup clickable @click="$emit('archive', obligation.id)">
            <q-item-section avatar>
              <q-icon name="archive" size="20px" color="negative" />
            </q-item-section>
            <q-item-section class="text-negative">Архивировать</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { OBLIGATION_TYPE_LABELS } from 'src/types/api'
import { useFormatMoney } from 'src/composables/useFormatMoney'

const props = defineProps({
  obligation: { type: Object, required: true },
  link: { type: Boolean, default: true }
})

defineEmits(['archive'])

const { formatMoney } = useFormatMoney()
const typeLabel = computed(() => OBLIGATION_TYPE_LABELS[props.obligation.type] || props.obligation.type)

const hasProgress = computed(
  () => props.obligation.progress_percent != null && props.obligation.total_amount
)

const typeIcons = {
  loan: 'home',
  installment: 'credit_score',
  personal_debt: 'person',
  rent: 'apartment',
  subscription: 'subscriptions',
  other: 'receipt_long'
}
const typeIcon = computed(() => typeIcons[props.obligation.type] || 'receipt_long')
</script>

<style scoped lang="scss">
.k-obligation {
  text-decoration: none;
  color: inherit;
}

.k-obligation--inactive {
  opacity: 0.6;
}

.k-obligation__progress {
  margin-top: 6px;
}

.k-obligation__progress-row {
  display: flex;
  justify-content: space-between;
  gap: var(--k-space-2);
  font-size: 0.75rem;
  color: var(--k-text-secondary);
  margin-bottom: 4px;
}

.k-obligation__status {
  margin-top: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--k-text-secondary);

  &--warn {
    color: var(--k-primary);
  }
}
</style>
