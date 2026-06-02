const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long'
})

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short'
})

const monthYearFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric'
})

export function useFormatDate () {
  function formatDate (iso) {
    if (!iso) return '—'
    return dateFormatter.format(new Date(iso))
  }

  function formatShortDate (iso) {
    if (!iso) return '—'
    return shortDateFormatter.format(new Date(iso))
  }

  function formatMonthYear (date) {
    return monthYearFormatter.format(date)
  }

  function formatPeriod (from, to) {
    return `${formatShortDate(from)} — ${formatShortDate(to)}`
  }

  function daysLabel (n) {
    const abs = Math.abs(n)
    const mod10 = abs % 10
    const mod100 = abs % 100
    if (mod100 >= 11 && mod100 <= 14) return `${n} дн.`
    if (mod10 === 1) return `${n} день`
    if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
    return `${n} дн.`
  }

  return {
    formatDate,
    formatShortDate,
    formatMonthYear,
    formatPeriod,
    daysLabel
  }
}
