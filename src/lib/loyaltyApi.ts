import { authService } from '@/services/authService'
import axios from 'axios'

const LOYALTY_BASE_URL = import.meta.env.VITE_LOYALTY_API_URL

export const loyaltyApi = axios.create({
	baseURL: LOYALTY_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
})

loyaltyApi.interceptors.request.use(config => {
	const token = authService.getAccessToken()
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})
