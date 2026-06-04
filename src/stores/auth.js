import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchCurrentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword
} from 'src/services/auth'
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const fieldErrors = ref(null)

  const isAuthenticated = computed(() => user.value !== null)

  function clearErrors () {
    error.value = null
    fieldErrors.value = null
  }

  function applyError (e) {
    error.value = e.message
    fieldErrors.value = e.errors || null
  }

  async function init () {
    if (ready.value) return
    loading.value = true
    clearErrors()
    try {
      user.value = await fetchCurrentUser()
    } catch {
      user.value = null
    } finally {
      loading.value = false
      ready.value = true
    }
  }

  async function signIn (credentials) {
    loading.value = true
    clearErrors()
    try {
      user.value = await login(credentials)
      return true
    } catch (e) {
      applyError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function signUp (payload) {
    loading.value = true
    clearErrors()
    try {
      user.value = await register(payload)
      return true
    } catch (e) {
      applyError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut () {
    loading.value = true
    clearErrors()
    try {
      await logout()
    } catch {
      void 0
    } finally {
      user.value = null
      loading.value = false
    }
  }

  async function requestPasswordReset (email) {
    loading.value = true
    clearErrors()
    try {
      const data = await forgotPassword(email)
      return data.message
    } catch (e) {
      applyError(e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function completePasswordReset (payload) {
    loading.value = true
    clearErrors()
    try {
      const data = await resetPassword(payload)
      return data.message
    } catch (e) {
      applyError(e)
      return null
    } finally {
      loading.value = false
    }
  }

  function fieldError (name) {
    const list = fieldErrors.value?.[name]
    return list?.[0] || null
  }

  return {
    user,
    ready,
    loading,
    error,
    fieldErrors,
    isAuthenticated,
    init,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    completePasswordReset,
    clearErrors,
    fieldError
  }
})
