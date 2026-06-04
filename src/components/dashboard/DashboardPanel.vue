<template>
  <div class="k-panel dashboard-panel">
    <section
      class="k-panel__section k-panel__section--accent dashboard-panel__hero"
      :class="'k-panel__section--' + data.zone"
    >
      <div class="dashboard-panel__head">
        <p class="k-panel__label">Можно тратить в день</p>
        <span class="k-zone-tag k-zone-tag--on-accent">{{ zoneShort }}</span>
      </div>
      <p class="k-panel__hero-value">{{ formatDailyLimit(data.primary_daily_limit) }}</p>
      <p class="k-panel__hero-meta">{{ primaryMeta }}</p>
    </section>

    <section v-if="showAnchorLimits" class="k-panel__section dashboard-panel__limits">
      <div class="k-limit-pair" :class="{ 'k-limit-pair--one': anchorCount === 1 }">
        <div v-if="data.anchors.import" class="k-limit-pair__item">
          <div class="k-limit-pair__name">До сверки</div>
          <div class="k-limit-pair__value">
            {{ formatDailyLimit(data.anchors.import.daily_limit) }}
          </div>
          <div class="k-limit-pair__days">{{ daysLabel(data.anchors.import.days_remaining) }}</div>
        </div>
        <div v-if="data.anchors.salary" class="k-limit-pair__item">
          <div class="k-limit-pair__name">До зарплаты</div>
          <div class="k-limit-pair__value">
            {{ formatDailyLimit(data.anchors.salary.daily_limit) }}
          </div>
          <div class="k-limit-pair__days">{{ daysLabel(data.anchors.salary.days_remaining) }}</div>
        </div>
      </div>
      <p v-if="zoneHint" class="dashboard-panel__hint">{{ zoneHint }}</p>
    </section>

    <section
      class="k-panel__section dashboard-panel__money"
      :class="{ 'dashboard-panel__money--solo': !data.next_obligation }"
    >
      <div class="k-cols-2">
        <div
          class="k-metric k-metric--tap"
          role="button"
          tabindex="0"
          @click="$emit('update-balance')"
          @keyup.enter="$emit('update-balance')"
        >
          <div class="k-metric__label">Счёт · нажмите, чтобы изменить</div>
          <div class="k-metric__value">{{ formatMoney(data.balance) }}</div>
          <div class="k-metric__sub">{{ balanceUpdated }}</div>
        </div>
        <div class="k-metric">
          <div class="k-metric__label">Свободно после платежей</div>
          <div class="k-metric__value">{{ formatMoney(data.free_after_obligations) }}</div>
          <div v-if="salaryDate" class="k-metric__sub">до {{ salaryDate }}</div>
        </div>
      </div>
    </section>

    <section v-if="data.next_obligation" class="k-panel__section dashboard-panel__payment">
      <p class="k-panel__label">Ближайший платёж</p>
      <p class="dashboard-panel__payment-title">{{ data.next_obligation.title }}</p>
      <p class="dashboard-panel__payment-meta">
        {{ formatMoney(data.next_obligation.amount) }}
        · через {{ daysLabel(data.next_obligation.days_until) }}
      </p>
      <div
        class="k-alert-inline"
        :class="data.next_obligation.balance_covers ? 'k-alert-inline--ok' : 'k-alert-inline--bad'"
      >
        <template v-if="data.next_obligation.balance_covers">
          На счёте достаточно
        </template>
        <template v-else>
          Не хватает {{ formatMoney(data.next_obligation.shortfall) }}
        </template>
      </div>
    </section>

    <section
      v-if="data.incomes"
      class="k-panel__section dashboard-panel__incomes"
    >
      <button type="button" class="dashboard-panel__link-head" @click="$emit('incomes')">
        <p class="k-panel__label">Доходы</p>
        <q-icon name="chevron_right" />
      </button>
      <p class="dashboard-panel__summary-line">
        {{ formatMoney(data.incomes.summary.total_this_month) }} за месяц
        <span v-if="data.incomes.summary.count_this_month">
          · {{ data.incomes.summary.count_this_month }} пост.
        </span>
      </p>
      <ul v-if="data.incomes.recent?.length" class="dashboard-panel__mini-list">
        <li v-for="row in data.incomes.recent" :key="row.id">
          {{ row.title }} — {{ formatMoney(row.amount) }}
        </li>
      </ul>
    </section>

    <section
      v-if="data.savings"
      class="k-panel__section dashboard-panel__savings"
    >
      <button type="button" class="dashboard-panel__link-head" @click="$emit('savings')">
        <p class="k-panel__label">Накопления</p>
        <q-icon name="chevron_right" />
      </button>
      <p class="dashboard-panel__summary-line">
        {{ formatMoney(data.savings.summary.total_balance) }} на счетах
        · +{{ formatMoney(data.savings.summary.total_monthly_contribution) }}/мес
      </p>
    </section>

    <section
      v-if="data.check_in_due || data.import_due || data.import_overdue"
      class="dashboard-panel__actions dashboard-panel__cta"
    >
      <button
        v-if="data.check_in_due"
        type="button"
        class="k-row-action"
        @click="$emit('check-in')"
      >
        <span class="k-row-action__icon"><q-icon name="fact_check" size="20px" /></span>
        <span class="k-row-action__text">Уточнить баланс · 30 сек</span>
        <q-icon name="chevron_right" class="k-row-action__chevron" />
      </button>
      <button
        v-if="data.import_due || data.import_overdue"
        type="button"
        class="k-row-action k-row-action--warm"
        @click="$emit('import')"
      >
        <span class="k-row-action__icon"><q-icon name="upload_file" size="20px" /></span>
        <span class="k-row-action__text">{{ importCta }}</span>
        <q-icon name="chevron_right" class="k-row-action__chevron" />
      </button>
    </section>

    <section class="dashboard-panel__actions dashboard-panel__cta">
      <button type="button" class="k-row-action" @click="$emit('settings')">
        <span class="k-row-action__icon"><q-icon name="tune" size="20px" /></span>
        <span class="k-row-action__text">Настройки и оформление</span>
        <q-icon name="chevron_right" class="k-row-action__chevron" />
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ZONE_LABELS } from 'src/types/api'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

const props = defineProps({
  data: { type: Object, required: true }
})

defineEmits(['update-balance', 'check-in', 'import', 'incomes', 'savings', 'settings'])

const { formatMoney, formatDailyLimit } = useFormatMoney()
const { formatDate, daysLabel } = useFormatDate()

const zoneShort = computed(() => {
  const m = { green: 'В норме', yellow: 'Тонко', red: 'Внимание' }
  return m[props.data.zone] || props.data.zone
})

const zoneHint = computed(() =>
  props.data.zone !== 'green' ? ZONE_LABELS[props.data.zone] : null
)

const primaryMeta = computed(() => {
  const anchor =
    props.data.anchors.primary === 'import'
      ? props.data.anchors.import
      : props.data.anchors.salary
  if (!anchor) return ''
  const kind = props.data.anchors.primary === 'import' ? 'сверки' : 'зарплаты'
  return `Основной расчёт до ${kind} · ${daysLabel(anchor.days_remaining)}`
})

const showAnchorLimits = computed(
  () => props.data.anchors?.import || props.data.anchors?.salary
)

const anchorCount = computed(() => {
  let n = 0
  if (props.data.anchors?.import) n++
  if (props.data.anchors?.salary) n++
  return n
})

const salaryDate = computed(() => {
  const d = props.data.anchors?.salary?.next_date
  return d ? formatDate(d) : null
})

const balanceUpdated = computed(() => {
  const at = props.data.balance_updated_at
  return at ? formatDate(at) : 'ещё не обновляли'
})

const importCta = computed(() =>
  props.data.import_overdue ? 'Загрузить выписку' : 'Подготовить сверку'
)
</script>

<style scoped lang="scss">
.dashboard-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--k-space-3);
  margin-bottom: var(--k-space-1);
}

.dashboard-panel__hint {
  margin: var(--k-space-3) 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--k-text-secondary);
}

.dashboard-panel__payment-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dashboard-panel__payment-meta {
  margin: var(--k-space-1) 0 0;
  font-size: 0.875rem;
  color: var(--k-text-secondary);
}

.dashboard-panel__actions {
  padding: 0;
}

.dashboard-panel__link-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  margin: 0 0 var(--k-space-2);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: inherit;

  .k-panel__label {
    margin: 0;
  }
}

.dashboard-panel__summary-line {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.dashboard-panel__mini-list {
  margin: var(--k-space-2) 0 0;
  padding-left: 1.1rem;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
  line-height: 1.5;
}
</style>
