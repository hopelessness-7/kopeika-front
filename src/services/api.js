import * as http from './api.http.js'
import * as mock from './api.mock.js'

const client = process.env.VITE_USE_MOCKS === 'true' ? mock : http

export const useMocks = process.env.VITE_USE_MOCKS === 'true'

export const fetchDashboard = client.fetchDashboard
export const updateBalance = client.updateBalance
export const submitCheckIn = client.submitCheckIn
export const fetchObligations = client.fetchObligations
export const fetchObligation = client.fetchObligation
export const createObligation = client.createObligation
export const updateObligation = client.updateObligation
export const archiveObligation = client.archiveObligation
export const fetchObligationPayments = client.fetchObligationPayments
export const createObligationPayment = client.createObligationPayment
export const deleteObligationPayment = client.deleteObligationPayment
export const closeObligation = client.closeObligation
export const reopenObligation = client.reopenObligation
export const fetchIncomes = client.fetchIncomes
export const fetchIncome = client.fetchIncome
export const createIncome = client.createIncome
export const updateIncome = client.updateIncome
export const deleteIncome = client.deleteIncome
export const fetchSavings = client.fetchSavings
export const fetchSaving = client.fetchSaving
export const createSaving = client.createSaving
export const updateSaving = client.updateSaving
export const deleteSaving = client.deleteSaving
export const fetchCalendar = client.fetchCalendar
export const fetchSettings = client.fetchSettings
export const updateSettings = client.updateSettings
export const fetchGoals = client.fetchGoals
export const fetchGoal = client.fetchGoal
export const createGoal = client.createGoal
export const updateGoal = client.updateGoal
export const deleteGoal = client.deleteGoal
export const registerPushSubscription = client.registerPushSubscription
export const unregisterPushSubscription = client.unregisterPushSubscription
