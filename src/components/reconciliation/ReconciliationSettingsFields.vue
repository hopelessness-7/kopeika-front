<template>
  <div class="k-stack">
    <p class="k-panel__label">Период сверки</p>
    <q-btn-toggle
      v-model="local.import_interval_days"
      spread
      no-caps
      unelevated
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      :options="intervalOptions"
      class="q-mb-md"
    />
    <q-select
      v-model="local.primary_anchor"
      :options="anchorOptions"
      label="Основной лимит"
      outlined
      dense
      emit-value
      map-options
      class="q-mb-md"
    />
    <q-input
      v-model.number="local.salary_day_of_month"
      type="number"
      label="День зарплаты (1–31)"
      outlined
      dense
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

const local = ref({ ...props.modelValue })

const intervalOptions = [
  { label: '7 дн.', value: 7 },
  { label: '10 дн.', value: 10 },
  { label: '14 дн.', value: 14 }
]

const anchorOptions = [
  { label: 'Авто', value: 'auto' },
  { label: 'До зарплаты', value: 'salary' },
  { label: 'До сверки', value: 'import' }
]

watch(
  () => props.modelValue,
  (v) => {
    local.value = { ...v }
  },
  { deep: true }
)

watch(
  local,
  (v) => emit('update:modelValue', { ...v }),
  { deep: true }
)
</script>
