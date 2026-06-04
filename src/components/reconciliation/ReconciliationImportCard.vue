<template>
  <router-link :to="`/reconciliation/${item.id}`" class="k-recon-card">
    <div class="k-recon-card__icon">
      <q-icon name="description" size="24px" />
    </div>
    <div class="k-recon-card__body">
      <p class="k-recon-card__title">{{ item.original_filename || 'Выписка' }}</p>
      <p class="k-recon-card__meta">
        {{ bankLabel }} · {{ periodLabel }}
      </p>
      <p class="k-recon-card__date">{{ importedLabel }}</p>
    </div>
    <q-icon name="chevron_right" class="k-recon-card__chevron" />
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useFormatDate } from 'src/composables/useFormatDate'

const props = defineProps({
  item: { type: Object, required: true }
})

const { formatDate } = useFormatDate()

const bankLabel = computed(() => {
  const m = { sber: 'Сбербанк' }
  return m[props.item.bank] || props.item.bank
})

const periodLabel = computed(() => {
  const { period_from: from, period_to: to } = props.item
  if (from && to) return `${formatDate(from)} — ${formatDate(to)}`
  return 'период не указан'
})

const importedLabel = computed(() => {
  const at = props.item.imported_at
  return at ? `Загружена ${formatDate(at)}` : ''
})
</script>

<style scoped lang="scss">
.k-recon-card {
  display: flex;
  align-items: center;
  gap: var(--k-space-3);
  padding: var(--k-space-4);
  background: var(--k-surface);
  border-radius: var(--k-radius-lg);
  border: 1px solid var(--k-border);
  margin-bottom: var(--k-space-3);
  text-decoration: none;
  color: inherit;

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--k-primary-soft);
    color: var(--k-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  &__meta,
  &__date {
    margin: 4px 0 0;
    font-size: 0.8125rem;
    color: var(--k-text-secondary);
  }

  &__chevron {
    color: var(--k-text-muted);
    flex-shrink: 0;
  }
}
</style>
