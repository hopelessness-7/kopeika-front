<template>
  <div class="k-payment" :class="{ 'k-payment--warn': !obligation.balance_covers }">
    <div class="k-payment__label">Следующий платёж</div>
    <div class="k-payment__title">{{ obligation.title }}</div>
    <div class="k-payment__meta">
      через {{ daysLabel(obligation.days_until) }} · {{ formatMoney(obligation.amount) }}
    </div>
    <div
      class="k-payment__alert"
      :class="obligation.balance_covers ? 'k-payment__alert--ok' : 'k-payment__alert--bad'"
    >
      <template v-if="!obligation.balance_covers">
        Не хватает {{ formatMoney(obligation.shortfall) }} на счёте
      </template>
      <template v-else>
        На счёте достаточно средств
      </template>
    </div>
  </div>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

defineProps({
  obligation: { type: Object, required: true }
})

const { formatMoney } = useFormatMoney()
const { daysLabel } = useFormatDate()
</script>
