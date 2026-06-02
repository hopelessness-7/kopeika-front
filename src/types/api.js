/**
 * @typedef {'green' | 'yellow' | 'red'} Zone
 * @typedef {'salary' | 'import'} AnchorKind
 * @typedef {'auto' | 'salary' | 'import'} PrimaryAnchor
 * @typedef {'quiet' | 'normal' | 'payments_only'} NotificationMode
 * @typedef {'loan' | 'installment' | 'personal_debt' | 'rent' | 'subscription' | 'other'} ObligationType
 * @typedef {'sber' | 'yandex_pay'} BankId
 * @typedef {'processing' | 'completed' | 'failed'} ImportStatus
 *
 * @typedef {Object} DashboardResponse
 * @property {number} balance
 * @property {string | null} balance_updated_at
 * @property {Zone} zone
 * @property {number} free_after_obligations
 * @property {Object} anchors
 * @property {AnchorKind} anchors.primary
 * @property {Object | null} anchors.salary
 * @property {Object | null} anchors.import
 * @property {number} primary_daily_limit
 * @property {Object | null} next_obligation
 * @property {number} obligations_until_salary_total
 * @property {boolean} check_in_due
 * @property {boolean} import_due
 * @property {boolean} import_overdue
 * @property {Object} streak
 *
 * @typedef {Object} Obligation
 * @property {number} id
 * @property {string} title
 * @property {ObligationType} type
 * @property {number} payment_amount
 * @property {number} payment_day
 * @property {number | null} remaining_amount
 * @property {number | null} total_amount
 * @property {number | null} interest_rate
 * @property {string | null} lender
 * @property {string | null} note
 * @property {boolean} is_active
 * @property {string} next_payment_date
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} UserSettings
 * @property {number | null} salary_day_of_month
 * @property {number | null} salary_amount
 * @property {7 | 10 | 14} import_interval_days
 * @property {string | null} last_import_at
 * @property {PrimaryAnchor} primary_anchor
 * @property {number | null} buffer_amount
 * @property {number | null} buffer_percent
 * @property {NotificationMode} notification_mode
 */

export const OBLIGATION_TYPES = /** @type {const} */ ([
  'loan',
  'installment',
  'personal_debt',
  'rent',
  'subscription',
  'other'
])

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
