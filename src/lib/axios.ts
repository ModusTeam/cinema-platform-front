import { getApiBaseUrl } from '@/lib/apiUrl'
import { authService } from '@/features/auth/api/auth.service'
import axios, { type AxiosError } from 'axios'

const BASE_URL = getApiBaseUrl()

export const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getErrorMessage = (error: AxiosError<any>): string => {
	if (!error.response) {
		if (error.code === 'ECONNABORTED') {
			return `Request timeout. Check API availability at ${BASE_URL}.`
		}

		return `Network error. Check API URL (${BASE_URL}) and protocol (http/https), CORS, or certificate.`
	}

	const data = error.response.data

	if (data?.extensions?.errors) {
		if (Array.isArray(data.extensions.errors)) {
			return data.extensions.errors
				.map((e: any) => e.ErrorMessage || e.message)
				.join('\n')
		}
		return Object.values(data.extensions.errors).flat().join('\n')
	}

	if (data?.detail) return data.detail
	if (data?.title) return data.title

	const status = error.response.status
	if (status >= 500) return `Server error (${status}). Please try again later.`
	if (status >= 400)
		return `Request failed (${status}). Please check your input.`

	return 'Сталася невідома помилка'
}

api.interceptors.request.use(config => {
	const token = authService.getAccessToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (!originalRequest) {
			return Promise.reject(error)
		}

		if (error.response?.status === 429 && !originalRequest._retry429) {
			originalRequest._retry429 = true
			console.warn('Rate limit hit. Retrying in 1s...')
			await wait(1000)
			return api(originalRequest)
		}

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes('/auth/login')
		) {
			originalRequest._retry = true

			try {
				const newToken = await authService.refreshToken()
				if (newToken) {
					originalRequest.headers.Authorization = `Bearer ${newToken}`
					return api(originalRequest)
				}
			} catch (refreshError) {
				authService.logout()
				return Promise.reject(refreshError)
			}
		}

		error.message = getErrorMessage(error)
		return Promise.reject(error)
	},
)
