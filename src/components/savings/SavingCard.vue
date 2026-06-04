<template>
  <article class="k-saving">
    <div class="k-saving__body">
      <h3 class="k-saving__title">{{ saving.title }}</h3>
      <p class="k-saving__bank">{{ saving.bank }}</p>
      <p class="k-saving__balance">{{ formatMoney(saving.balance) }}</p>
      <p class="k-saving__meta">+{{ formatMoney(saving.monthly_contribution) }} / мес</p>
    </div>
    <div class="k-saving__actions">
      <q-btn flat round dense icon="edit" aria-label="Изменить" @click="$emit('edit', saving.id)" />
      <q-btn flat round dense icon="delete" color="negative" aria-label="Удалить" @click="$emit('remove', saving.id)" />
    </div>
  </article>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'

defineProps({
  saving: { type: Object, required: true }
})

defineEmits(['edit', 'remove'])

const { formatMoney } = useFormatMoney()
</script>

<style scoped lang="scss">
.k-saving {
  display: flex;
  gap: var(--k-space-3);
  padding: var(--k-space-4);
  background: var(--k-surface);
  border-radius: var(--k-radius-lg);
  border: 1px solid var(--k-border);
  margin-bottom: var(--k-space-3);

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  &__bank {
    margin: 4px 0 0;
    font-size: 0.75rem;
    color: var(--k-text-muted);
  }

  &__balance {
    margin: 8px 0 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__meta {
    margin: 4px 0 0;
    font-size: 0.8125rem;
    color: var(--k-text-secondary);
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
  }
}
</style>
