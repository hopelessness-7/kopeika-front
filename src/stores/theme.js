import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  applyTheme,
  getStoredThemeMode,
  resolveTheme
} from 'src/utils/theme'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref(getStoredThemeMode())
  const resolved = ref(resolveTheme(mode.value))

  /** @param {'light' | 'system' | 'dark'} next */
  function setMode (next) {
    mode.value = next
    resolved.value = applyTheme(next)
  }

  return { mode, resolved, setMode }
})
