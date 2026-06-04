import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const apiBase = process.env.VITE_API_URL || 'http://localhost:8080/api'

function apiOrigin () {
  try {
    return new URL(apiBase).origin
  } catch {
    return 'http://localhost:8080'
  }
}

const api = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

function readCookie (name) {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[2]) : null
}

api.interceptors.request.use((config) => {
  const xsrf = readCookie('XSRF-TOKEN')
  if (xsrf) {
    config.headers['X-XSRF-TOKEN'] = xsrf
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return response
    }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    const body = error.response?.data
    const err = new Error(body?.message || error.message || 'Не удалось выполнить запрос')
    err.status = error.response?.status
    err.errors = body?.errors || null
    return Promise.reject(err)
  }
)

export async function ensureCsrfCookie () {
  await axios.get(`${apiOrigin()}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
}

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
