<template>
  <article class="k-income" :class="{ 'k-income--recurring': income.is_recurring }">
    <div class="k-income__body">
      <div class="k-income__title-row">
        <h3 class="k-income__title">{{ income.title }}</h3>
        <span v-if="income.is_recurring" class="k-income__badge">
          <q-icon name="autorenew" size="14px" />
          ежемесячно
        </span>
      </div>
      <p v-if="income.description" class="k-income__desc">{{ income.description }}</p>
      <p class="k-income__meta">
        {{ formatMoney(income.amount) }}
        ·
        <template v-if="income.is_recurring && income.day_of_month">
          {{ income.day_of_month }}-е число
        </template>
        <template v-else>
          {{ formatDate(income.received_at) }}
        </template>
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

  &--recurring {
    border-color: rgba(13, 148, 136, 0.28);
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: var(--k-space-2);
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 999px;
    background: rgba(13, 148, 136, 0.12);
    color: var(--k-primary);
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
