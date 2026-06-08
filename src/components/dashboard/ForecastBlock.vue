<template>
  <section v-if="hasContent" class="k-panel__section forecast-block dashboard-panel__forecast">
    <p class="k-panel__label">Прогноз</p>

    <div v-if="nextIncome" class="forecast-block__hero">
      <q-icon name="trending_up" color="positive" size="20px" />
      <div>
        <p class="forecast-block__hero-line">
          Ожидается <strong>+{{ formatMoney(nextIncome.amount) }}</strong>
          <span v-if="nextIncome.title"> · {{ nextIncome.title }}</span>
        </p>
        <p class="forecast-block__hero-meta">
          {{ formatDate(nextIncome.date) }}
          <span v-if="nextIncome.days_until !== null">
            · через {{ daysLabel(nextIncome.days_until) }}
          </span>
          <span v-if="nextIncome.recurring"> · регулярно</span>
        </p>
      </div>
    </div>

    <div v-if="coverage" class="forecast-block__coverage" :class="coverageClass">
      <p class="forecast-block__coverage-title">
        Платёж {{ formatDate(coverage.due_date) }} —
        {{ formatMoney(coverage.amount) }}
      </p>
      <p class="forecast-block__coverage-line">
        К дате баланс ≈ <strong>{{ formatMoney(coverage.expected_balance_at_due) }}</strong>
        <span v-if="Number(coverage.expected_incomes_total) > 0">
          (поступит +{{ formatMoney(coverage.expected_incomes_total) }})
        </span>
      </p>
      <p class="forecast-block__coverage-verdict">
        <template v-if="coverage.covers">
          <q-icon name="check_circle" size="16px" color="positive" />
          Хватит. Останется {{ formatMoney(coverage.surplus_after) }}
        </template>
        <template v-else>
          <q-icon name="error_outline" size="16px" color="negative" />
          Не хватает {{ formatMoney(coverage.shortfall) }}
        </template>
      </p>
    </div>

    <div v-if="payoff.length" class="forecast-block__payoff">
      <p class="forecast-block__sub-label">Когда закроется долг</p>
      <ul class="forecast-block__payoff-list">
        <li v-for="row in payoff" :key="row.obligation_id">
          <div class="forecast-block__payoff-row">
            <span class="forecast-block__payoff-title">{{ row.title }}</span>
            <span class="forecast-block__payoff-meta">
              <template v-if="row.never_closes">
                платежа не хватает
              </template>
              <template v-else>
                {{ row.months_to_close }} мес · {{ formatShortDate(row.expected_close_at) }}
              </template>
            </span>
          </div>
          <div v-if="row.never_closes && row.min_payment_to_close" class="forecast-block__payoff-warn">
            Чтобы покрыть проценты, нужно ≥ {{ formatMoney(row.min_payment_to_close) }}/мес
          </div>
          <div v-else-if="row.total_interest > 0" class="forecast-block__payoff-sub">
            Всего к выплате {{ formatMoney(row.total_to_pay) }}
            · переплата {{ formatMoney(row.total_interest) }}
            <span v-if="row.interest_rate"> · {{ row.interest_rate }}%</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

const props = defineProps({
  forecast: { type: Object, default: null }
})

const { formatMoney } = useFormatMoney()
const { formatDate, formatShortDate, daysLabel } = useFormatDate()

const nextIncome = computed(() => props.forecast?.next_income || null)
const coverage = computed(() => props.forecast?.next_obligation_coverage || null)
const payoff = computed(() => props.forecast?.debt_payoff || [])

const coverageClass = computed(() =>
  coverage.value?.covers ? 'forecast-block__coverage--ok' : 'forecast-block__coverage--bad'
)

const hasContent = computed(
  () => nextIncome.value || coverage.value || payoff.value.length
)
</script>

<style scoped lang="scss">
.forecast-block__hero {
  display: flex;
  align-items: flex-start;
  gap: var(--k-space-3);
  padding-bottom: var(--k-space-3);
  border-bottom: 1px solid var(--k-border);
  margin-bottom: var(--k-space-3);
}

.forecast-block__hero-line {
  margin: 0;
  font-size: 0.9375rem;
}

.forecast-block__hero-meta {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}

.forecast-block__coverage {
  padding: var(--k-space-3);
  border-radius: var(--k-radius-md);
  margin-bottom: var(--k-space-3);

  &--ok {
    background: rgba(34, 197, 94, 0.08);
  }

  &--bad {
    background: rgba(244, 63, 94, 0.08);
  }
}

.forecast-block__coverage-title {
  margin: 0;
  font-weight: 600;
  font-size: 0.9375rem;
}

.forecast-block__coverage-line {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: var(--k-text-secondary);
}

.forecast-block__coverage-verdict {
  margin: 8px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.forecast-block__sub-label {
  margin: 0 0 var(--k-space-2);
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--k-text-secondary);
}

.forecast-block__payoff-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--k-space-2);
  font-size: 0.875rem;
}

.forecast-block__payoff-list li {
  display: grid;
  gap: 4px;
}

.forecast-block__payoff-row {
  display: flex;
  justify-content: space-between;
  gap: var(--k-space-3);
}

.forecast-block__payoff-meta {
  color: var(--k-text-secondary);
  white-space: nowrap;
}

.forecast-block__payoff-sub {
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}

.forecast-block__payoff-warn {
  font-size: 0.8125rem;
  color: var(--k-color-negative, #b91c1c);
}
</style>
