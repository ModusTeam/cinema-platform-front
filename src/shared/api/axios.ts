import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl } from '@/shared/api/apiUrl'
import { tokenStorage } from '@/shared/api/tokenStorage'

const BASE_URL = getApiBaseUrl()
const refreshClient = axios.create({ baseURL: BASE_URL })

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

interface ErrorBody {
  detail?: string
  title?: string
  extensions?: { errors?: unknown }
}

const errorText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    const entry = value as { ErrorMessage?: unknown; message?: unknown }
    if (typeof entry.ErrorMessage === 'string') return entry.ErrorMessage
    if (typeof entry.message === 'string') return entry.message
  }
  return ''
}

const getErrorMessage = (error: AxiosError<ErrorBody>): string => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return `Request timeout. Check API availability at ${BASE_URL}.`
    }
    return `Network error. Check API URL (${BASE_URL}) and protocol (http/https), CORS, or certificate.`
  }

  const data = error.response.data
  const errors = data?.extensions?.errors
  if (errors) {
    const entries = Array.isArray(errors)
      ? errors
      : typeof errors === 'object'
        ? Object.values(errors).flat()
        : []
    const message = entries.map(errorText).filter(Boolean).join('\n')
    if (message) return message
  }

  if (data?.detail) return data.detail
  if (data?.title) return data.title

  const status = error.response.status
  if (status >= 500) return `Server error (${status}). Please try again later.`
  if (status >= 400)
    return `Request failed (${status}). Please check your input.`
  return 'Сталася невідома помилка'
}

let refreshPromise: Promise<string | null> | null = null

export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return Promise.resolve(null)

  refreshPromise = refreshClient
    .post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh-token',
      { token: refreshToken },
    )
    .then(({ data }) => {
      if (tokenStorage.getRefreshToken() !== refreshToken) return null
      tokenStorage.setTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    })
    .catch(() => {
      if (tokenStorage.getRefreshToken() === refreshToken) tokenStorage.clear()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

api.interceptors.request.use(config => {
  const token = tokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ErrorBody>) => {
    const request = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _retry429?: boolean })
      | undefined
    if (!request) return Promise.reject(error)

    // Replaying a mutation after 429 can duplicate a server-side operation.
    const method = request.method?.toLowerCase()
    if (
      error.response?.status === 429 &&
      !request._retry429 &&
      ['get', 'head', 'options'].includes(method ?? '')
    ) {
      request._retry429 = true
      await new Promise(resolve => setTimeout(resolve, 1000))
      return api(request)
    }

    if (
      error.response?.status === 401 &&
      !request._retry &&
      !request.url?.includes('/auth/') &&
      tokenStorage.getRefreshToken()
    ) {
      request._retry = true
      const currentToken = tokenStorage.getAccessToken()
      if (
        currentToken &&
        request.headers.Authorization !== `Bearer ${currentToken}`
      ) {
        request.headers.Authorization = `Bearer ${currentToken}`
        return api(request)
      }
      const token = await refreshAccessToken()
      if (token) {
        request.headers.Authorization = `Bearer ${token}`
        return api(request)
      }
    }

    error.message = getErrorMessage(error)
    return Promise.reject(error)
  },
)
