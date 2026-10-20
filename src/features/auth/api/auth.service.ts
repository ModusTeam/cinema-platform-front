import { api, refreshAccessToken } from '@/shared/api/axios'
import { tokenStorage } from '@/shared/api/tokenStorage'
import type { User, AuthResponse } from '@/features/auth/model/auth.types'
import { jwtDecode } from 'jwt-decode'

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })

    authService.setTokens(data.accessToken, data.refreshToken)
    const user = authService.getUserFromToken(data.accessToken)
    if (!user) {
      authService.logout()
      throw new Error('Invalid access token')
    }
    return user
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
    return refreshAccessToken()
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    tokenStorage.setTokens(accessToken, refreshToken)
  },

  logout: () => {
    tokenStorage.clear()
    delete api.defaults.headers.common.Authorization
  },

  getAccessToken: tokenStorage.getAccessToken,

  getCurrentUser: (): User | null => {
    const token = tokenStorage.getAccessToken()
    if (!token) return null
    return authService.getUserFromToken(token)
  },

  getUserFromToken: (token: string): User | null => {
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token)

      const role =
        decoded.role ||
        decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] ||
        'User'
      const claim = (key: string): string | null => {
        const value = decoded[key]
        return typeof value === 'string' ? value : null
      }

      return {
        id: claim('sub') ?? '',
        email: claim('email') ?? '',
        name: claim('firstName') ?? claim('given_name') ?? 'User',
        surname: claim('lastName') ?? claim('family_name') ?? '',
        role: typeof role === 'string' ? role.toLocaleLowerCase() : 'user',
      }
    } catch {
      return null
    }
  },
}
