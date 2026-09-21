/**
 * @typedef {'green' | 'yellow' | 'red'} Zone
 * @typedef {'quiet' | 'normal' | 'payments_only'} NotificationMode
 * @typedef {'loan' | 'installment' | 'personal_debt' | 'rent' | 'subscription' | 'other'} ObligationType
 * @typedef {'planned' | 'paid' | 'skipped'} ObligationPaymentStatus
 *
 * @typedef {Object} DashboardResponse
 * @property {number} balance
 * @property {string | null} balance_updated_at
 * @property {Zone} zone
 * @property {number} free_after_obligations
 * @property {Object} anchors
 * @property {number | null} anchors.primary_income_id
 * @property {Array} anchors.items
 * @property {number} primary_daily_limit
 * @property {Object | null} next_obligation
 * @property {number} obligations_until_primary_anchor_total
 * @property {NotificationMode} notification_mode
 * @property {boolean} check_in_due
 * @property {Object} streak
 * @property {Object} goals
 *
 * @typedef {Object} UserSettings
 * @property {NotificationMode} notification_mode
 * @property {string | null} last_check_in_at
 * @property {number} check_in_streak_weeks
 * @property {number | null} buffer_amount
 */

export const OBLIGATION_TYPES = /** @type {const} */ ([
  'loan',
  'installment',
  'personal_debt',
  'rent',
  'subscription',
  'other'
])

export const DEBT_OBLIGATION_TYPES = /** @type {const} */ ([
  'loan',
  'installment',
  'personal_debt'
])

export function isDebt (type) {
  return DEBT_OBLIGATION_TYPES.includes(type)
}

/** @type {Record<import('./api.js').ObligationType, string>} */
export const OBLIGATION_TYPE_LABELS = {
  loan: 'Кредит',
  installment: 'Рассрочка',
  personal_debt: 'Долг человеку',
  rent: 'Аренда',
  subscription: 'Подписка',
  other: 'Другое'
}

export const ZONE_LABELS = {
  green: 'В пределах плана',
  yellow: 'Запас тонкий — имеет смысл сдержать траты',
  red: 'До следующего дохода не хватает на обязательства'
}

export const ZONE_COLORS = {
  green: 'teal',
  yellow: 'amber',
  red: 'red'
}
