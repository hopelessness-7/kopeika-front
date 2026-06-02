import { api } from 'boot/axios'
import dashboardMock from 'src/mocks/dashboard.json'
import obligationsMock from 'src/mocks/obligations.json'
import calendarMock from 'src/mocks/calendar.json'
import settingsMock from 'src/mocks/settings.json'
import importSummaryMock from 'src/mocks/import-summary.json'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

function delay (ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone (data) {
  return JSON.parse(JSON.stringify(data))
}

let obligationsStore = clone(obligationsMock)
let settingsStore = clone(settingsMock)
let dashboardStore = clone(dashboardMock)

export function isUsingMocks () {
  return useMocks
}

export async function fetchDashboard () {
  if (useMocks) {
    await delay()
    return clone(dashboardStore)
  }
  const { data } = await api.get('/dashboard')
  return data
}

export async function updateBalance (amount, recordedAt) {
  if (useMocks) {
    await delay()
    dashboardStore.balance = amount
    dashboardStore.balance_updated_at = recordedAt || new Date().toISOString()
    return {
      balance: dashboardStore.balance,
      balance_updated_at: dashboardStore.balance_updated_at
    }
  }
  const { data } = await api.post('/balance', {
    amount,
    recorded_at: recordedAt
  })
  return data
}

export async function submitCheckIn (payload) {
  if (useMocks) {
    await delay()
    if (!payload.balance_confirmed && payload.balance_amount != null) {
      dashboardStore.balance = payload.balance_amount
      dashboardStore.balance_updated_at = new Date().toISOString()
    }
    dashboardStore.check_in_due = false
    dashboardStore.streak.check_in_weeks += 1
    return clone(dashboardStore)
  }
  const { data } = await api.post('/check-in', payload)
  return data
}

export async function fetchObligations () {
  if (useMocks) {
    await delay()
    return obligationsStore.filter((o) => o.is_active)
  }
  const { data } = await api.get('/obligations')
  return data
}

export async function fetchObligation (id) {
  if (useMocks) {
    await delay()
    const item = obligationsStore.find((o) => o.id === Number(id))
    if (!item) throw new Error('Обязательство не найдено')
    return clone(item)
  }
  const { data } = await api.get(`/obligations/${id}`)
  return data
}

export async function createObligation (input) {
  if (useMocks) {
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
  const { data } = await api.post('/obligations', input)
  return data
}

export async function updateObligation (id, input) {
  if (useMocks) {
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
  const { data } = await api.put(`/obligations/${id}`, input)
  return data
}

export async function archiveObligation (id) {
  if (useMocks) {
    await delay()
    const index = obligationsStore.findIndex((o) => o.id === Number(id))
    if (index === -1) throw new Error('Обязательство не найдено')
    obligationsStore[index].is_active = false
    return
  }
  await api.delete(`/obligations/${id}`)
}

export async function fetchCalendar (from, to) {
  if (useMocks) {
    await delay()
    return clone(calendarMock)
  }
  const { data } = await api.get('/calendar', { params: { from, to } })
  return data
}

export async function fetchSettings () {
  if (useMocks) {
    await delay()
    return clone(settingsStore)
  }
  const { data } = await api.get('/settings')
  return data
}

export async function updateSettings (input) {
  if (useMocks) {
    await delay()
    settingsStore = { ...settingsStore, ...input }
    return clone(settingsStore)
  }
  const { data } = await api.put('/settings', input)
  return data
}

export async function uploadImport (bank, file) {
  if (useMocks) {
    await delay(800)
    return { id: 1, status: 'completed', bank }
  }
  const form = new FormData()
  form.append('bank', bank)
  form.append('file', file)
  const { data } = await api.post('/imports', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function fetchImport (id) {
  if (useMocks) {
    await delay()
    return {
      id: Number(id),
      status: 'completed',
      bank: 'sber',
      period_from: importSummaryMock.period_from,
      period_to: importSummaryMock.period_to,
      error_message: null
    }
  }
  const { data } = await api.get(`/imports/${id}`)
  return data
}

export async function fetchImportSummary (id) {
  if (useMocks) {
    await delay()
    return clone(importSummaryMock)
  }
  const { data } = await api.get(`/imports/${id}/summary`)
  return data
}

export async function confirmImport (id, balance) {
  if (useMocks) {
    await delay()
    dashboardStore.balance = balance
    dashboardStore.balance_updated_at = new Date().toISOString()
    dashboardStore.import_overdue = false
    dashboardStore.import_due = false
    dashboardStore.primary_daily_limit = importSummaryMock.new_daily_limit
    if (dashboardStore.anchors.import) {
      dashboardStore.anchors.import.daily_limit = importSummaryMock.new_daily_limit
      dashboardStore.anchors.import.last_import_at = new Date().toISOString().slice(0, 10)
    }
    settingsStore.last_import_at = new Date().toISOString().slice(0, 10)
    return clone(dashboardStore)
  }
  const { data } = await api.post(`/imports/${id}/confirm`, { balance })
  return data
}

export async function pollImportUntilDone (id, maxAttempts = 15, intervalMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await fetchImport(id)
    if (result.status !== 'processing') return result
    await delay(intervalMs)
  }
  throw new Error('Импорт занимает слишком много времени')
}
