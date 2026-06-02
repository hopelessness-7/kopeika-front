import { defineBoot } from '#q-app/wrappers'
import { initTheme, watchSystemTheme } from 'src/utils/theme'

export default defineBoot(() => {
  initTheme()
  watchSystemTheme()
})
