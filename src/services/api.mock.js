import dashboardMock from 'src/mocks/dashboard.json'
import obligationsMock from 'src/mocks/obligations.json'
import calendarMock from 'src/mocks/calendar.json'

function delay (ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone (data) {
  return JSON.parse(JSON.stringify(data))
}

let obligationsStore = clone(obligationsMock)
let settingsStore = {
  notification_mode: 'normal',
  last_check_in_at: '2026-05-25T10:00:00+03:00',
  check_in_streak_weeks: 2,
  buffer_amount: null
}
let goalsStore = [
  {
    id: 1,
    title: 'Ноутбук',
    target_amount: 120000,
    saved_amount: 35000,
    target_date: '2027-02-08',
    is_active: true
  }
]
let dashboardStore = clone(dashboardMock)

export async function fetchDashboard () {
  await delay()
  return clone(dashboardStore)
}

export async function updateBalance (amount, recordedAt) {
  await delay()
  dashboardStore.balance = amount
  dashboardStore.balance_updated_at = recordedAt || new Date().toISOString()
  return {
    balance: dashboardStore.balance,
    balance_updated_at: dashboardStore.balance_updated_at
  }
}

export async function submitCheckIn (payload) {
  await delay()
  if (!payload.balance_confirmed && payload.balance_amount != null) {
    dashboardStore.balance = payload.balance_amount
    dashboardStore.balance_updated_at = new Date().toISOString()
  }
  dashboardStore.check_in_due = false
  dashboardStore.streak.check_in_weeks += 1
  return clone(dashboardStore)
}

export async function fetchObligations () {
  await delay()
  return obligationsStore.filter((o) => o.is_active)
}

export async function fetchObligation (id) {
  await delay()
  const item = obligationsStore.find((o) => o.id === Number(id))
  if (!item) throw new Error('Обязательство не найдено')
  return clone(item)
}

export async function createObligation (input) {
  await delay()
  const id = Math.max(0, ...obligationsStore.map((o) => o.id)) + 1
  const now = new Date().toISOString()
  const item = {
    id,
    ...input,
    is_active: input.is_active ?? true,
    next_payment_date: '2026-06-15',
    created_at: now,
    updated_at: now
  }
  obligationsStore.push(item)
  return clone(item)
}

export async function updateObligation (id, input) {
  await delay()
  const index = obligationsStore.findIndex((o) => o.id === Number(id))
  if (index === -1) throw new Error('Обязательство не найдено')
  obligationsStore[index] = {
    ...obligationsStore[index],
    ...input,
    updated_at: new Date().toISOString()
  }
  return clone(obligationsStore[index])
}

export async function archiveObligation (id) {
  await delay()
  const index = obligationsStore.findIndex((o) => o.id === Number(id))
  if (index === -1) throw new Error('Обязательство не найдено')
  obligationsStore[index].is_active = false
}

const obligationPaymentsStore = {}

export async function fetchObligationPayments (obligationId) {
  await delay()
  return clone(obligationPaymentsStore[obligationId] || [])
}

export async function createObligationPayment (obligationId, input) {
  await delay()
  const list = obligationPaymentsStore[obligationId] || []
  const id = Math.max(0, ...list.map((p) => p.id)) + 1
  const item = {
    id,
    obligation_id: Number(obligationId),
    amount: input.amount,
    status: input.status || 'paid',
    paid_at: input.paid_at || new Date().toISOString(),
    due_date: input.due_date || (input.paid_at || new Date().toISOString()).slice(0, 10),
    note: input.note || null,
    created_at: new Date().toISOString()
  }
  obligationPaymentsStore[obligationId] = [item, ...list]
  return clone(item)
}

export async function deleteObligationPayment (obligationId, paymentId) {
  await delay()
  const list = obligationPaymentsStore[obligationId] || []
  obligationPaymentsStore[obligationId] = list.filter((p) => p.id !== Number(paymentId))
}

export async function closeObligation (id) {
  await delay()
  const index = obligationsStore.findIndex((o) => o.id === Number(id))
  if (index === -1) throw new Error('Обязательство не найдено')
  obligationsStore[index].is_active = false
  obligationsStore[index].remaining_amount = 0
  obligationsStore[index].ends_at = new Date().toISOString().slice(0, 10)
  return clone(obligationsStore[index])
}

export async function reopenObligation (id) {
  await delay()
  const index = obligationsStore.findIndex((o) => o.id === Number(id))
  if (index === -1) throw new Error('Обязательство не найдено')
  obligationsStore[index].is_active = true
  obligationsStore[index].ends_at = null
  return clone(obligationsStore[index])
}

export async function fetchCalendar (from, to) {
  await delay()
  const days = calendarMock.days.filter((d) => d.date >= from && d.date <= to)
  return clone({ days })
}

export async function fetchSettings () {
  await delay()
  return clone(settingsStore)
}

export async function updateSettings (input) {
  await delay()
  settingsStore = { ...settingsStore, ...input }
  return clone(settingsStore)
}

let incomesStore = [
  {
    id: 1,
    title: 'Зарплата',
    description: 'ООО Работа',
    amount: 150000,
    received_at: '2026-05-25'
  }
]

let savingsStore = [
  {
    id: 1,
    title: 'Подушка',
    bank: 'Сбербанк',
    balance: 320000,
    monthly_contribution: 25000
  }
]

export async function fetchIncomes () {
  await delay()
  return clone(incomesStore)
}

export async function fetchIncome (id) {
  await delay()
  const item = incomesStore.find((i) => i.id === Number(id))
  if (!item) throw new Error('Доход не найден')
  return clone(item)
}

export async function createIncome (input) {
  await delay()
  const id = Math.max(0, ...incomesStore.map((i) => i.id)) + 1
  const item = { id, ...input }
  incomesStore.push(item)
  return clone(item)
}

export async function updateIncome (id, input) {
  await delay()
  const index = incomesStore.findIndex((i) => i.id === Number(id))
  if (index === -1) throw new Error('Доход не найден')
  incomesStore[index] = { ...incomesStore[index], ...input }
  return clone(incomesStore[index])
}

export async function deleteIncome (id) {
  await delay()
  incomesStore = incomesStore.filter((i) => i.id !== Number(id))
}

export async function fetchSavings () {
  await delay()
  return clone(savingsStore)
}

export async function fetchSaving (id) {
  await delay()
  const item = savingsStore.find((s) => s.id === Number(id))
  if (!item) throw new Error('Накопление не найдено')
  return clone(item)
}

export async function createSaving (input) {
  await delay()
  const id = Math.max(0, ...savingsStore.map((s) => s.id)) + 1
  const item = { id, ...input }
  savingsStore.push(item)
  return clone(item)
}

export async function updateSaving (id, input) {
  await delay()
  const index = savingsStore.findIndex((s) => s.id === Number(id))
  if (index === -1) throw new Error('Накопление не найдено')
  savingsStore[index] = { ...savingsStore[index], ...input }
  return clone(savingsStore[index])
}

export async function deleteSaving (id) {
  await delay()
  savingsStore = savingsStore.filter((s) => s.id !== Number(id))
}

export async function fetchGoals () {
  await delay()
  return clone(goalsStore)
}

export async function fetchGoal (id) {
  await delay()
  const item = goalsStore.find((g) => g.id === Number(id))
  if (!item) throw new Error('Цель не найдена')
  return clone(item)
}

export async function createGoal (input) {
  await delay()
  const id = Math.max(0, ...goalsStore.map((g) => g.id)) + 1
  const item = { id, is_active: true, saved_amount: 0, ...input }
  goalsStore.push(item)
  return clone(item)
}

export async function updateGoal (id, input) {
  await delay()
  const index = goalsStore.findIndex((g) => g.id === Number(id))
  if (index === -1) throw new Error('Цель не найдена')
  goalsStore[index] = { ...goalsStore[index], ...input }
  return clone(goalsStore[index])
}

export async function deleteGoal (id) {
  await delay()
  goalsStore = goalsStore.filter((g) => g.id !== Number(id))
}

export async function registerPushSubscription () {
  await delay()
  return { id: 1, endpoint: 'mock-endpoint' }
}

export async function unregisterPushSubscription () {
  await delay()
}
