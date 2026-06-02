<template>
  <div class="k-obligation">
    <div class="k-obligation__icon">
      <q-icon :name="typeIcon" size="24px" />
    </div>
    <div class="k-obligation__body">
      <div class="k-obligation__title">{{ obligation.title }}</div>
      <span class="k-obligation__type">{{ typeLabel }}</span>
      <div class="k-obligation__amount">
        {{ formatMoney(obligation.payment_amount) }}/мес · {{ obligation.payment_day }}-е число
      </div>
      <div v-if="obligation.remaining_amount" class="k-obligation__remain">
        Остаток {{ formatMoney(obligation.remaining_amount) }}
      </div>
    </div>
    <q-btn flat round dense icon="more_vert" color="grey-7">
      <q-menu class="k-card" anchor="bottom right" self="top right">
        <q-list style="min-width: 160px">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { OBLIGATION_TYPE_LABELS } from 'src/types/api'
import { useFormatMoney } from 'src/composables/useFormatMoney'

const props = defineProps({
  obligation: { type: Object, required: true }
})

defineEmits(['archive'])

const { formatMoney } = useFormatMoney()
const typeLabel = computed(() => OBLIGATION_TYPE_LABELS[props.obligation.type] || props.obligation.type)

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
