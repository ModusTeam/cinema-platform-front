import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { adminUsersService } from '@/features/admin/api/admin-users.service'

interface PaginationState {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const useUsers = () => {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminUsersService.getAll(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const isArrayResponse = Array.isArray(data)

  const usersList = isArrayResponse ? data : data?.items || []

  const pagination: PaginationState = {
    pageNumber: isArrayResponse ? 1 : data?.pageNumber || page,
    pageSize: isArrayResponse ? usersList.length : pageSize,
    totalPages: isArrayResponse ? 1 : data?.totalPages || 1,
    totalCount: isArrayResponse ? usersList.length : data?.totalCount || 0,
    hasPreviousPage: isArrayResponse ? false : data?.hasPreviousPage || false,
    hasNextPage: isArrayResponse ? false : data?.hasNextPage || false,
  }

  const changeRoleMutation = useMutation({
    mutationFn: ({
      userId,
      newRole,
    }: {
      userId: string
      newRole: 'Admin' | 'User'
    }) => adminUsersService.changeRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const changeUserRole = async (userId: string, newRole: 'Admin' | 'User') => {
    try {
      await changeRoleMutation.mutateAsync({ userId, newRole })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data || 'Помилка зміни ролі'
      return { success: false, error: msg }
    }
  }

  return {
    users: usersList,
    isLoading: isLoading || (isPlaceholderData && !data),
    pagination,
    changePage: setPage,
    changeUserRole,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  }
}
