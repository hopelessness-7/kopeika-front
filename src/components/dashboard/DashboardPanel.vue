<template>
  <div class="k-panel dashboard-panel">
    <DashboardReminders v-if="data.notification_mode" :data="data" />

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
      <ul v-if="anchorItems.length > 1" class="dashboard-panel__anchors">
        <li v-for="anchor in anchorItems" :key="anchor.income_id">
          {{ anchor.title }} · {{ formatDailyLimit(anchor.daily_limit) }}/день
          · {{ daysLabel(anchor.days_remaining) }}
        </li>
      </ul>
      <p v-if="streakWeeks" class="dashboard-panel__streak">
        {{ streakLabel }}
      </p>
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
          <div v-if="primaryAnchorDate" class="k-metric__sub">до {{ primaryAnchorDate }}</div>
        </div>
      </div>
    </section>

    <ForecastBlock v-if="data.forecast" :forecast="data.forecast" />

    <GoalsSnippet
      v-if="data.goals"
      :goals="data.goals"
      @goals="$emit('goals')"
    />

    <section v-if="data.next_obligation" class="k-panel__section dashboard-panel__payment">
      <p class="k-panel__label">Ближайший платёж</p>
      <p class="dashboard-panel__payment-title">{{ data.next_obligation.title }}</p>
      <p class="dashboard-panel__payment-meta">
        {{ formatMoney(data.next_obligation.amount) }}
        · через {{ daysLabel(data.next_obligation.days_until) }}
      </p>
      <div
        v-if="data.next_obligation.progress_percent != null"
        class="dashboard-panel__progress"
      >
        <div class="dashboard-panel__progress-row">
          <span>Погашено</span>
          <span>{{ data.next_obligation.progress_percent }}%</span>
        </div>
        <q-linear-progress
          :value="data.next_obligation.progress_percent / 100"
          size="8px"
          rounded
          color="primary"
          track-color="grey-3"
        />
        <p
          v-if="data.next_obligation.remaining_amount != null"
          class="dashboard-panel__progress-meta"
        >
          Остаток {{ formatMoney(data.next_obligation.remaining_amount) }}
        </p>
      </div>
      <div
        v-if="data.next_obligation.needs_close"
        class="k-alert-inline k-alert-inline--ok q-mt-sm"
      >
        Долг погашен — закройте в карточке обязательства
      </div>
      <div
        v-else
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

    <section class="dashboard-panel__actions dashboard-panel__cta">
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
      <button type="button" class="k-row-action" @click="$emit('settings')">
        <span class="k-row-action__icon"><q-icon name="tune" size="20px" /></span>
        <span class="k-row-action__text">Настройки</span>
        <q-icon name="chevron_right" class="k-row-action__chevron" />
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'
import ForecastBlock from 'src/components/dashboard/ForecastBlock.vue'
import DashboardReminders from 'src/components/dashboard/DashboardReminders.vue'
import GoalsSnippet from 'src/components/dashboard/GoalsSnippet.vue'

const props = defineProps({
  data: { type: Object, required: true }
})

defineEmits(['update-balance', 'check-in', 'incomes', 'savings', 'settings', 'goals'])

const { formatMoney, formatDailyLimit } = useFormatMoney()
const { formatDate, daysLabel } = useFormatDate()

const zoneShort = computed(() => {
  const m = { green: 'В норме', yellow: 'Тонко', red: 'Внимание' }
  return m[props.data.zone] || props.data.zone
})

const anchorItems = computed(() => props.data.anchors?.items || [])

const primaryAnchor = computed(() => {
  const id = props.data.anchors?.primary_income_id
  return anchorItems.value.find((a) => a.income_id === id) || anchorItems.value[0] || null
})

const primaryMeta = computed(() => {
  if (!primaryAnchor.value) {
    return 'Настройте доходы-якоря в разделе «Доходы»'
  }
  return `До «${primaryAnchor.value.title}» · ${daysLabel(primaryAnchor.value.days_remaining)}`
})

const primaryAnchorDate = computed(() => {
  const d = primaryAnchor.value?.next_date
  return d ? formatDate(d) : null
})

const streakWeeks = computed(() => props.data.streak?.check_in_weeks ?? 0)

const streakLabel = computed(() => {
  const n = streakWeeks.value
  if (!n) return ''
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'недель'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'неделя'
    else if (mod10 >= 2 && mod10 <= 4) word = 'недели'
  }
  return `${n} ${word} сверок подряд`
})

const balanceUpdated = computed(() => {
  const at = props.data.balance_updated_at
  return at ? formatDate(at) : 'ещё не обновляли'
})
</script>

<style scoped lang="scss">
.dashboard-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--k-space-3);
  margin-bottom: var(--k-space-1);
}

.dashboard-panel__anchors {
  margin: var(--k-space-2) 0 0;
  padding-left: 1.1rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.45;
}

.dashboard-panel__streak {
  margin: var(--k-space-2) 0 0;
  font-size: 0.8125rem;
  opacity: 0.9;
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

.dashboard-panel__progress {
  margin-top: var(--k-space-3);
}

.dashboard-panel__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
  margin-bottom: 4px;
}

.dashboard-panel__progress-meta {
  margin: 4px 0 0;
  font-size: 0.8125rem;
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
