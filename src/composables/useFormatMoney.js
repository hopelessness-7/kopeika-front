const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

export function useFormatMoney () {
  function formatMoney (value, { compact = false } = {}) {
    if (value == null || Number.isNaN(Number(value))) return '—'
    const num = Number(value)
    if (compact && Math.abs(num) >= 1000) {
      return `~${Math.round(num).toLocaleString('ru-RU')} ₽`
    }
    return moneyFormatter.format(num).replace(/\u00A0/g, ' ')
  }

  function formatDailyLimit (value) {
    if (value == null || Number.isNaN(Number(value))) return '—'
    const rounded = Math.round(Number(value))
    return `~${rounded.toLocaleString('ru-RU')} ₽/день`
  }

  return { formatMoney, formatDailyLimit }
}
