import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default defineBoot(async () => {
  const auth = useAuthStore()
  await auth.init()
})
