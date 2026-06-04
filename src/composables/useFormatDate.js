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

export function toDateKey (date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey (key) {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function useFormatDate () {
  function formatDate (iso) {
    if (!iso) return '—'
    const date = parseDateKey(iso) ?? new Date(iso)
    return dateFormatter.format(date)
  }

  function formatShortDate (iso) {
    if (!iso) return '—'
    const date = parseDateKey(iso) ?? new Date(iso)
    return shortDateFormatter.format(date)
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
    daysLabel,
    toDateKey,
    parseDateKey
  }
}
