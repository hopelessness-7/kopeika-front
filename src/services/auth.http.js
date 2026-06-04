import { api, ensureCsrfCookie } from 'boot/axios'

export async function fetchCurrentUser () {
  try {
    const { data } = await api.get('/user')
    return data?.id ? data : null
  } catch (e) {
    if (e.status === 401 || e.status === 403) {
      return null
    }
    throw e
  }
}

export async function login (credentials) {
  await ensureCsrfCookie()
  const { data } = await api.post('/login', credentials)
  return data
}

export async function register (payload) {
  await ensureCsrfCookie()
  const { data } = await api.post('/register', payload)
  return data
}

export async function logout () {
  await api.post('/logout')
}

export async function forgotPassword (email) {
  await ensureCsrfCookie()
  const { data } = await api.post('/forgot-password', { email })
  return data
}

export async function resetPassword (payload) {
  await ensureCsrfCookie()
  const { data } = await api.post('/reset-password', payload)
  return data
}
