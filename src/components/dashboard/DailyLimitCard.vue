<template>
  <div class="k-hero" :class="'k-hero--' + zone">
    <div v-if="showZone" class="k-hero__zone">
      <ZoneBadge :zone="zone" inline />
    </div>
    <div class="k-hero__label">Можно тратить в день</div>
    <div class="k-hero__amount">{{ formatDailyLimit(limit) }}</div>
    <div class="k-hero__sub">{{ subtitle }}</div>
  </div>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'
import ZoneBadge from 'src/components/common/ZoneBadge.vue'

defineProps({
  limit: { type: Number, required: true },
  subtitle: { type: String, required: true },
  zone: { type: String, default: 'green' },
  showZone: { type: Boolean, default: true }
})

const { formatDailyLimit } = useFormatMoney()
</script>
