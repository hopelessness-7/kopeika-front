<template>
  <div class="cal">
    <div class="cal__layout">
    <div class="k-panel cal__panel">
      <div class="k-panel__section cal__toolbar">
        <div class="cal__nav">
          <q-btn flat round dense icon="chevron_left" @click="$emit('prev-month')" />
          <div>
            <div class="cal__month">{{ monthLabel }}</div>
            <div v-if="monthTotal > 0" class="cal__month-total">
              Платежи в месяце: {{ formatMoney(monthTotal) }}
            </div>
          </div>
          <q-btn flat round dense icon="chevron_right" @click="$emit('next-month')" />
        </div>
      </div>

      <div class="k-panel__section cal__grid-wrap">
        <div class="cal__weekdays">
          <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>
        <div class="cal__grid">
          <button
            v-for="day in days"
            :key="day.key"
            type="button"
            class="cal__cell"
            :class="{
              'cal__cell--off': !day.inMonth,
              'cal__cell--pay': day.total > 0,
              'cal__cell--selected': day.key === selectedKey,
              'cal__cell--today': day.isToday
            }"
            :disabled="!day.inMonth"
            @click="onSelect(day)"
          >
            <span class="cal__cell-day">{{ day.date.getDate() }}</span>
            <span v-if="day.total > 0 && day.inMonth" class="cal__cell-sum">
              {{ formatShortAmount(day.total) }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="selectedKey" class="k-panel__section cal__detail">
        <div class="cal__detail-head">
          <span class="cal__detail-date">{{ selectedLabel }}</span>
          <span v-if="selectedTotal" class="cal__detail-total">{{ formatMoney(selectedTotal) }}</span>
        </div>

        <div v-if="selectedPayments.length" class="cal__payments">
          <div
            v-for="ob in selectedPayments"
            :key="ob.id"
            class="cal__payment-row"
          >
            <div class="cal__payment-dot" />
            <div class="cal__payment-body">
              <div class="cal__payment-title">{{ ob.title }}</div>
              <div class="cal__payment-type">{{ typeLabel(ob.type) }}</div>
            </div>
            <div class="cal__payment-amount">{{ formatMoney(ob.amount) }}</div>
          </div>
        </div>
        <p v-else class="cal__empty">В этот день платежей нет</p>
      </div>
    </div>

    <div v-if="upcoming.length" class="cal__upcoming">
      <h3 class="cal__upcoming-title">Ближайшие платежи</h3>
      <div class="k-panel">
        <button
          v-for="item in upcoming"
          :key="item.date + item.id"
          type="button"
          class="cal__upcoming-row"
          @click="$emit('select-date', item.date)"
        >
          <div class="cal__upcoming-date">
            <span class="cal__upcoming-day">{{ item.dayNum }}</span>
            <span class="cal__upcoming-mon">{{ item.monthShort }}</span>
          </div>
          <div class="cal__upcoming-body">
            <div class="cal__upcoming-name">{{ item.title }}</div>
            <div class="cal__upcoming-meta">{{ item.daysUntil }}</div>
          </div>
          <div class="cal__upcoming-sum">{{ formatMoney(item.amount) }}</div>
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { OBLIGATION_TYPE_LABELS } from 'src/types/api'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { parseDateKey, useFormatDate } from 'src/composables/useFormatDate'

const props = defineProps({
  monthLabel: String,
  days: { type: Array, required: true },
  paymentsByDate: { type: Object, required: true },
  selectedKey: { type: String, default: null },
  currentMonth: { type: Date, required: true }
})

const emit = defineEmits(['prev-month', 'next-month', 'select', 'select-date'])

const { formatMoney } = useFormatMoney()
const { formatShortDate } = useFormatDate()

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const monthTotal = computed(() => {
  let sum = 0
  for (const day of Object.values(props.paymentsByDate)) {
    sum += day.total || 0
  }
  return sum
})

const selectedDayData = computed(() =>
  props.selectedKey ? props.paymentsByDate[props.selectedKey] : null
)
const selectedPayments = computed(() => selectedDayData.value?.obligations || [])
const selectedTotal = computed(() => selectedDayData.value?.total || 0)
const selectedLabel = computed(() =>
  props.selectedKey ? formatShortDate(props.selectedKey) : ''
)

const upcoming = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const items = []
  for (const [date, day] of Object.entries(props.paymentsByDate)) {
    for (const ob of day.obligations || []) {
      const d = parseDateKey(date)
      if (!d || d < today) continue
      const diff = Math.round((d - today) / 86400000)
      items.push({
        date,
        id: ob.id,
        title: ob.title,
        amount: ob.amount,
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString('ru-RU', { month: 'short' }),
        daysUntil: diff === 0 ? 'сегодня' : diff === 1 ? 'завтра' : `через ${diff} дн.`
      })
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6)
})

function typeLabel (type) {
  return OBLIGATION_TYPE_LABELS[type] || type
}

function formatShortAmount (n) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(Math.round(n))
}

function onSelect (day) {
  if (!day.inMonth) return
  emit('select', day.key)
}
</script>

<style scoped lang="scss">
.cal__toolbar {
  padding-top: var(--k-space-3);
  padding-bottom: var(--k-space-3);
}

.cal__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--k-space-2);
}

.cal__month {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: capitalize;
  text-align: center;
}

.cal__month-total {
  font-size: 0.75rem;
  color: var(--k-text-secondary);
  text-align: center;
  margin-top: 2px;
}

.cal__grid-wrap {
  padding-top: 0;
}

.cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: var(--k-space-2);

  span {
    text-align: center;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--k-text-muted);
    text-transform: uppercase;
  }
}

.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal__cell {
  aspect-ratio: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  padding: 2px;
  transition: background 0.12s, transform 0.12s;

  &--off {
    opacity: 0.25;
    pointer-events: none;
  }

  &--pay:not(&--selected) {
    background: var(--k-primary-soft);
  }

  &--today:not(&--selected) .cal__cell-day {
    color: var(--k-primary);
    font-weight: 700;
  }

  &--selected {
    background: var(--k-primary);
    color: #fff;
    transform: scale(1.04);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);

    .cal__cell-sum {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }
}

.cal__cell-day {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
}

.cal__cell-sum {
  font-size: 0.5625rem;
  font-weight: 700;
  color: var(--k-primary);
  line-height: 1;
}

.cal__detail-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--k-space-3);
}

.cal__detail-date {
  font-size: 0.9375rem;
  font-weight: 700;
}

.cal__detail-total {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--k-primary);
}

.cal__payments {
  display: flex;
  flex-direction: column;
  gap: var(--k-space-3);
}

.cal__payment-row {
  display: flex;
  align-items: center;
  gap: var(--k-space-3);
}

.cal__payment-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--k-primary);
  flex-shrink: 0;
}

.cal__payment-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.cal__payment-type {
  font-size: 0.75rem;
  color: var(--k-text-muted);
}

.cal__payment-amount {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.cal__empty {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-text-muted);
  text-align: center;
}

.cal__upcoming {
  margin-top: var(--k-space-4);
}

.cal__upcoming-title {
  margin: 0 0 var(--k-space-3);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--k-text-muted);
}

.cal__upcoming-row {
  display: flex;
  align-items: center;
  gap: var(--k-space-3);
  width: 100%;
  padding: var(--k-space-3) var(--k-space-4);
  border: none;
  border-top: 1px solid var(--k-divider);
  background: var(--k-surface);
  font-family: inherit;
  cursor: pointer;
  text-align: left;

  &:first-child {
    border-top: none;
  }

  &:active {
    background: #f8fafc;
  }
}

.cal__upcoming-date {
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.cal__upcoming-day {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--k-primary);
}

.cal__upcoming-mon {
  display: block;
  font-size: 0.625rem;
  text-transform: uppercase;
  color: var(--k-text-muted);
}

.cal__upcoming-body {
  flex: 1;
  min-width: 0;
}

.cal__upcoming-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.cal__upcoming-meta {
  font-size: 0.75rem;
  color: var(--k-text-secondary);
}

.cal__upcoming-sum {
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
