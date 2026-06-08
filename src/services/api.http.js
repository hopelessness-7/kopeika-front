import { api } from 'boot/axios'

function unwrapList (payload) {
  if (Array.isArray(payload)) return payload
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return payload ?? []
}

function unwrapOne (payload) {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload
}

export async function fetchDashboard () {
  const { data } = await api.get('/dashboard')
  return data
}

export async function updateBalance (amount, recordedAt) {
  const { data } = await api.post('/balance', {
    amount,
    recorded_at: recordedAt
  })
  return data
}

export async function submitCheckIn (payload) {
  const { data } = await api.post('/check-in', payload)
  return data
}

export async function fetchObligations () {
  const { data } = await api.get('/obligations')
  return unwrapList(data)
}

export async function fetchObligation (id, { withSummary = false } = {}) {
  const params = withSummary ? { with_summary: 1 } : undefined
  const { data } = await api.get(`/obligations/${id}`, { params })
  return unwrapOne(data)
}

export async function fetchObligationPayments (obligationId) {
  const { data } = await api.get(`/obligations/${obligationId}/payments`)
  return unwrapList(data)
}

export async function createObligationPayment (obligationId, input) {
  const { data } = await api.post(`/obligations/${obligationId}/payments`, input)
  return unwrapOne(data)
}

export async function deleteObligationPayment (obligationId, paymentId) {
  await api.delete(`/obligations/${obligationId}/payments/${paymentId}`)
}

export async function closeObligation (obligationId) {
  const { data } = await api.post(`/obligations/${obligationId}/close`)
  return unwrapOne(data)
}

export async function reopenObligation (obligationId) {
  const { data } = await api.post(`/obligations/${obligationId}/reopen`)
  return unwrapOne(data)
}

export async function createObligation (input) {
  const { data } = await api.post('/obligations', input)
  return unwrapOne(data)
}

export async function updateObligation (id, input) {
  const { data } = await api.put(`/obligations/${id}`, input)
  return unwrapOne(data)
}

export async function archiveObligation (id) {
  await api.delete(`/obligations/${id}`)
}

export async function fetchIncomes () {
  const { data } = await api.get('/incomes')
  return unwrapList(data)
}

export async function fetchIncome (id) {
  const { data } = await api.get(`/incomes/${id}`)
  return unwrapOne(data)
}

export async function createIncome (input) {
  const { data } = await api.post('/incomes', input)
  return unwrapOne(data)
}

export async function updateIncome (id, input) {
  const { data } = await api.put(`/incomes/${id}`, input)
  return unwrapOne(data)
}

export async function deleteIncome (id) {
  await api.delete(`/incomes/${id}`)
}

export async function fetchSavings () {
  const { data } = await api.get('/savings')
  return unwrapList(data)
}

export async function fetchSaving (id) {
  const { data } = await api.get(`/savings/${id}`)
  return unwrapOne(data)
}

export async function createSaving (input) {
  const { data } = await api.post('/savings', input)
  return unwrapOne(data)
}

export async function updateSaving (id, input) {
  const { data } = await api.put(`/savings/${id}`, input)
  return unwrapOne(data)
}

export async function deleteSaving (id) {
  await api.delete(`/savings/${id}`)
}

export async function fetchReconciliationSettings () {
  const { data } = await api.get('/reconciliation/settings')
  return data
}

export async function updateReconciliationSettings (input) {
  const { data } = await api.put('/reconciliation/settings', input)
  return data
}

export async function fetchReconciliationImports () {
  const { data } = await api.get('/reconciliation/imports')
  return unwrapList(data)
}

export async function fetchReconciliationImport (id) {
  const { data } = await api.get(`/reconciliation/imports/${id}`)
  return data
}

export async function uploadReconciliationImport (bank, file) {
  const form = new FormData()
  form.append('bank', bank)
  form.append('file', file)
  const { data } = await api.post('/reconciliation/imports', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function downloadReconciliationImport (id) {
  const base = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:8080'
  window.open(`${base}/api/reconciliation/imports/${id}/download`, '_blank', 'noopener')
}

export async function fetchCalendar (from, to) {
  const { data } = await api.get('/calendar', { params: { from, to } })
  const payload = unwrapOne(data) ?? data
  if (Array.isArray(payload)) return { days: payload }
  return { days: payload?.days ?? [] }
}

export async function fetchSettings () {
  const { data } = await api.get('/settings')
  return data
}

export async function updateSettings (input) {
  const { data } = await api.put('/settings', input)
  return data
}
