<template>
  <section class="k-panel__section">
    <p class="k-panel__label">Оформление</p>
    <p class="theme-hint">Светлая, тёмная или как в системе</p>
    <q-btn-toggle
      :model-value="theme.mode"
      spread
      no-caps
      unelevated
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      :options="options"
      @update:model-value="theme.setMode"
    />
  </section>
</template>

<script setup>
import { useThemeStore } from 'src/stores/theme'

const theme = useThemeStore()

const options = [
  { label: 'Светлая', value: 'light' },
  { label: 'Система', value: 'system' },
  { label: 'Тёмная', value: 'dark' }
]
</script>

<style scoped>
.theme-hint {
  margin: -4px 0 var(--k-space-3);
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}
</style>
