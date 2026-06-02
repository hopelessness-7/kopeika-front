<template>
  <q-page class="k-page k-page--wide">
    <PageHeader title="Календарь" subtitle="Платежи по дням месяца" />

    <div class="k-page-body">
      <PageState :loading="loading" :error="error" :retry="load">
        <CalendarInteractive
          :month-label="monthLabel"
          :days="calendarDays"
          :payments-by-date="paymentsByDate"
          :selected-key="selectedKey"
          :current-month="current"
          @prev-month="prevMonth"
          @next-month="nextMonth"
          @select="selectDay"
          @select-date="jumpToDate"
        />
      </PageState>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchCalendar } from 'src/services/api'
import { useFormatDate } from 'src/composables/useFormatDate'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import CalendarInteractive from 'src/components/calendar/CalendarInteractive.vue'

const { formatMonthYear } = useFormatDate()

const current = ref(new Date())
const calendarData = ref({ days: [] })
const loading = ref(false)
const error = ref(null)
const selectedKey = ref(null)

const monthLabel = computed(() => formatMonthYear(current.value))

const paymentsByDate = computed(() => {
  const map = {}
  for (const day of calendarData.value.days || []) {
    map[day.date] = day
  }
  return map
})

const todayKey = computed(() => new Date().toISOString().slice(0, 10))

const calendarDays = computed(() => {
  const year = current.value.getFullYear()
  const month = current.value.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)
  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const key = date.toISOString().slice(0, 10)
    const payment = paymentsByDate.value[key]
    days.push({
      key,
      date,
      inMonth: date.getMonth() === month,
      total: payment?.total || 0,
      isToday: key === todayKey.value
    })
  }
  return days
})

function prevMonth () {
  current.value = new Date(current.value.getFullYear(), current.value.getMonth() - 1, 1)
}

function nextMonth () {
  current.value = new Date(current.value.getFullYear(), current.value.getMonth() + 1, 1)
}

function selectDay (key) {
  selectedKey.value = key
}

function jumpToDate (dateStr) {
  selectedKey.value = dateStr
}

watch(current, () => {
  selectedKey.value = null
  load()
})

async function load () {
  loading.value = true
  error.value = null
  const year = current.value.getFullYear()
  const month = current.value.getMonth()
  const from = new Date(year, month, 1).toISOString().slice(0, 10)
  const to = new Date(year, month + 1, 0).toISOString().slice(0, 10)
  try {
    calendarData.value = await fetchCalendar(from, to)
    const today = new Date()
    if (today.getMonth() === month && today.getFullYear() === year) {
      selectedKey.value = today.toISOString().slice(0, 10)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
