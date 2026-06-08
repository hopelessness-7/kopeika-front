import dashboardMock from 'src/mocks/dashboard.json'
import obligationsMock from 'src/mocks/obligations.json'
import calendarMock from 'src/mocks/calendar.json'
import importSummaryMock from 'src/mocks/import-summary.json'

function delay (ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone (data) {
  return JSON.parse(JSON.stringify(data))
}

let obligationsStore = clone(obligationsMock)
let settingsStore = { notification_mode: 'normal', last_check_in_at: null }
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

let importsStore = []

let reconciliationSettings = {
  import_interval_days: 10,
  last_import_at: '2026-05-22T10:00:00+03:00',
  primary_anchor: 'auto',
  salary_day_of_month: 25
}

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

export async function fetchReconciliationSettings () {
  await delay()
  return clone(reconciliationSettings)
}

export async function updateReconciliationSettings (input) {
  await delay()
  reconciliationSettings = { ...reconciliationSettings, ...input }
  return clone(reconciliationSettings)
}

export async function fetchReconciliationImports () {
  await delay()
  return clone(importsStore)
}

export async function fetchReconciliationImport (id) {
  await delay()
  const item = importsStore.find((i) => i.id === Number(id))
  if (!item) throw new Error('Выписка не найдена')
  return clone(item)
}

export async function uploadReconciliationImport (bank, file) {
  void file
  await delay(500)
  const item = {
    id: importsStore.length + 1,
    bank,
    status: 'completed',
    period_from: importSummaryMock.period_from,
    period_to: importSummaryMock.period_to,
    original_filename: 'mock.csv',
    file_size: 1024,
    imported_at: new Date().toISOString(),
    transactions_count: 12,
    summary: {
      actual_spend: importSummaryMock.actual_spend,
      planned_spend: importSummaryMock.planned_spend,
      delta: importSummaryMock.delta
    }
  }
  importsStore.unshift(item)
  reconciliationSettings.last_import_at = new Date().toISOString()
  return clone(item)
}

export async function downloadReconciliationImport () {
  void 0
}
