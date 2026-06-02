import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kopeika_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Не удалось выполнить запрос'
    return Promise.reject(new Error(message))
  }
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
