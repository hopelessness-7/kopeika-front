<template>
  <div
    class="k-zone-pill"
    :class="[
      inline ? '' : 'k-zone-pill--standalone k-zone-pill--' + zone
    ]"
  >
    <q-icon v-if="!inline" :name="iconName" size="18px" />
    <div>
      <span>{{ zoneLabel }}</span>
      <div v-if="!inline" class="k-zone-pill__hint">{{ hint }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ZONE_LABELS } from 'src/types/api'

const props = defineProps({
  zone: {
    type: String,
    required: true,
    validator: (v) => ['green', 'yellow', 'red'].includes(v)
  },
  inline: { type: Boolean, default: false }
})

const hint = computed(() => ZONE_LABELS[props.zone] || '')
const zoneLabel = computed(() => {
  const map = { green: 'В норме', yellow: 'Тонкий запас', red: 'Нужно внимание' }
  return map[props.zone] || props.zone
})
const iconName = computed(() => {
  const map = { green: 'check_circle', yellow: 'warning_amber', red: 'info' }
  return map[props.zone] || 'circle'
})
</script>
