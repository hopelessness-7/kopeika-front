import * as http from './auth.http.js'
import * as mock from './auth.mock.js'

const client = process.env.VITE_USE_MOCKS === 'true' ? mock : http

export const fetchCurrentUser = client.fetchCurrentUser
export const login = client.login
export const register = client.register
export const logout = client.logout
export const forgotPassword = client.forgotPassword
export const resetPassword = client.resetPassword
