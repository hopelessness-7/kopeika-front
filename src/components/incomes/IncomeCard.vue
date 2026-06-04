<template>
  <article class="k-income">
    <div class="k-income__body">
      <h3 class="k-income__title">{{ income.title }}</h3>
      <p v-if="income.description" class="k-income__desc">{{ income.description }}</p>
      <p class="k-income__meta">
        {{ formatMoney(income.amount) }} · {{ formatDate(income.received_at) }}
      </p>
    </div>
    <div class="k-income__actions">
      <q-btn flat round dense icon="edit" aria-label="Изменить" @click="$emit('edit', income.id)" />
      <q-btn flat round dense icon="delete" color="negative" aria-label="Удалить" @click="$emit('remove', income.id)" />
    </div>
  </article>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

defineProps({
  income: { type: Object, required: true }
})

defineEmits(['edit', 'remove'])

const { formatMoney } = useFormatMoney()
const { formatDate } = useFormatDate()
</script>

<style scoped lang="scss">
.k-income {
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

  &__desc {
    margin: 4px 0 0;
    font-size: 0.8125rem;
    color: var(--k-text-secondary);
  }

  &__meta {
    margin: 6px 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--k-primary);
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
  }
}
</style>
