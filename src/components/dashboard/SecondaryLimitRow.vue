<template>
  <div class="k-chip-row">
    <q-icon :name="icon" size="20px" />
    <span>
      {{ label }}:
      <strong>{{ formatDailyLimit(limit) }}</strong>
      <span class="text-grey-6"> · {{ daysLabel(days) }}</span>
    </span>
  </div>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

defineProps({
  label: String,
  limit: Number,
  days: Number,
  icon: { type: String, default: 'event' }
})

const { formatDailyLimit } = useFormatMoney()
const { daysLabel } = useFormatDate()
</script>
