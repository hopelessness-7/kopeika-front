import { Dark } from 'quasar'

export const THEME_STORAGE_KEY = 'kopeika_theme'

/** @typedef {'light' | 'system' | 'dark'} ThemeMode */

/** @param {ThemeMode} mode */
export function resolveTheme (mode) {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** @param {ThemeMode} mode */
export function applyTheme (mode) {
  const resolved = resolveTheme(mode)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-theme-mode', mode)
  Dark.set(resolved === 'dark')
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    void 0
  }
  return resolved
}

export function initTheme () {
  /** @type {ThemeMode} */
  let mode = 'system'
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'system' || saved === 'dark') mode = saved
  } catch {
    void 0
  }
  return applyTheme(mode)
}

/** @type {MediaQueryList | null} */
let mediaQuery = null

export function watchSystemTheme () {
  if (typeof window === 'undefined') return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const mode = document.documentElement.getAttribute('data-theme-mode')
    if (mode === 'system') applyTheme('system')
  })
}

/** @param {ThemeMode} mode */
export function setThemeMode (mode) {
  return applyTheme(mode)
}

export function getStoredThemeMode () {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'system' || saved === 'dark') return saved
  } catch {
    void 0
  }
  return 'system'
}
