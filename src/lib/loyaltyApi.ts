import { getLoyaltyApiBaseUrl } from '@/lib/apiUrl'
import { authService } from '@/services/authService'
import axios, { type AxiosError } from 'axios'

const LOYALTY_BASE_URL = getLoyaltyApiBaseUrl()

const getErrorMessage = (error: AxiosError<any>): string => {
	if (!error.response) {
		if (error.code === 'ECONNABORTED') {
			return `Request timeout. Check Loyalty API availability at ${LOYALTY_BASE_URL}.`
		}

		return `Network error. Check Loyalty API URL (${LOYALTY_BASE_URL}), CORS, or certificate.`
	}

	const data = error.response.data

	if (typeof data?.message === 'string') return data.message
	if (Array.isArray(data?.message)) return data.message.join('\n')
	if (data?.error) return data.error
	if (data?.detail) return data.detail
	if (data?.title) return data.title

	if (error.response.status === 403) {
		return 'У вас немає доступу до loyalty сервісу.'
	}

	if (error.response.status >= 500) {
		return `Loyalty service error (${error.response.status}). Please try again later.`
	}

	return `Request failed (${error.response.status}). Please try again.`
}

export const loyaltyApi = axios.create({
	baseURL: LOYALTY_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
})

loyaltyApi.interceptors.request.use(config => {
	const token = authService.getAccessToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

loyaltyApi.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			originalRequest._retry = true

			try {
				const newToken = await authService.refreshToken()
				if (newToken) {
					originalRequest.headers.Authorization = `Bearer ${newToken}`
					return loyaltyApi(originalRequest)
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
