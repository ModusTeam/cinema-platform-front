import { api } from '@/lib/axios'
import type { User, AuthResponse } from '@/features/auth/model/auth.types'
import { jwtDecode } from 'jwt-decode'

const ACCESS_TOKEN_KEY = 'cinema_access_token'
const REFRESH_TOKEN_KEY = 'cinema_refresh_token'

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })

    authService.setTokens(data.accessToken, data.refreshToken)
    return authService.getUserFromToken(data.accessToken)!
  },

  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> => {
    await api.post<{ userId: string }>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    })
  },

  refreshToken: async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!currentRefreshToken) return null

    try {
      const { data } = await api.post<AuthResponse>('/auth/refresh-token', {
        token: currentRefreshToken,
      })

      authService.setTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    } catch (error) {
      console.error('Refresh failed', error)
      authService.logout()
      return null
    }
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    delete api.defaults.headers.common['Authorization']
  },

  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!token) return null
    return authService.getUserFromToken(token)
  },

  getUserFromToken: (token: string): User | null => {
    try {
      const decoded = jwtDecode<any>(token)

      const role =
        decoded.role ||
        decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] ||
        'User'

      return {
        id: decoded.sub || '',
        email: decoded.email || '',
        name: decoded.firstName || decoded.given_name || 'User',
        surname: decoded.lastName || decoded.family_name || '',
        role: typeof role === 'string' ? role.toLocaleLowerCase() : 'user',
      }
    } catch (e) {
      return null
    }
  },
}
