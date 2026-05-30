import { api } from '../lib/axios'
import type { PaginatedResult } from '@/shared/types/common.types'

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export const adminUsersService = {
  getAll: async (
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResult<UserDto>> => {
    const { data } = await api.get<PaginatedResult<UserDto>>('/users', {
      params: {
        pageNumber: page,
        pageSize,
      },
    })
    return data
  },

  changeRole: async (userId: string, newRole: 'Admin' | 'User') => {
    await api.put(`/users/${userId}/role`, { roleName: newRole })
  },
}
