import { api } from '@/shared/api/axios'

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export const adminUsersService = {
  getAll: async (): Promise<UserDto[]> => {
    const { data } = await api.get<UserDto[]>('/users')
    return data
  },

  changeRole: async (userId: string, newRole: 'Admin' | 'User') => {
    await api.put(`/users/${userId}/role`, { roleName: newRole })
  },
}
