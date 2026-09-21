<template>
  <section v-if="goals?.items?.length" class="k-panel__section dashboard-panel__goals">
    <button type="button" class="dashboard-panel__link-head" @click="$emit('goals')">
      <p class="k-panel__label">Цели</p>
      <q-icon name="chevron_right" />
    </button>
    <div
      v-for="goal in goals.items"
      :key="goal.id"
      class="goals-snippet__item"
    >
      <div class="goals-snippet__head">
        <span class="goals-snippet__title">{{ goal.title }}</span>
        <span class="goals-snippet__amount">
          {{ formatMoney(goal.saved_amount) }} / {{ formatMoney(goal.target_amount) }}
        </span>
      </div>
      <q-linear-progress
        :value="(goal.plan?.progress_percent ?? 0) / 100"
        size="6px"
        rounded
        color="primary"
        track-color="grey-3"
        class="q-mt-xs"
      />
      <p v-if="goal.plan?.comfortable" class="goals-snippet__hint">
        Комфортно: {{ formatMoney(goal.plan.comfortable.monthly_amount) }}/мес
        · ~{{ goal.plan.comfortable.months_to_goal }} мес
      </p>
    </div>
  </section>
</template>

<script setup>
import { useFormatMoney } from 'src/composables/useFormatMoney'

defineProps({
  goals: { type: Object, default: null }
})

defineEmits(['goals'])

const { formatMoney } = useFormatMoney()
</script>

<style scoped lang="scss">
.goals-snippet__item + .goals-snippet__item {
  margin-top: var(--k-space-3);
  padding-top: var(--k-space-3);
  border-top: 1px solid var(--k-border);
}

.goals-snippet__head {
  display: flex;
  justify-content: space-between;
  gap: var(--k-space-2);
  font-size: 0.875rem;
}

.goals-snippet__title {
  font-weight: 600;
}

.goals-snippet__amount {
  color: var(--k-text-secondary);
  white-space: nowrap;
}

.goals-snippet__hint {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}
</style>
