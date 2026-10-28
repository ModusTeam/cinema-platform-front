import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUsersService } from '@/features/admin/api/admin-users.service'

export const useUsers = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUsersService.getAll,
    staleTime: 5 * 60 * 1000,
  })

  const usersList = data ?? []

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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Помилка зміни ролі'
      return { success: false, error: msg }
    }
  }

  return {
    users: usersList,
    isLoading,
    isError,
    refetch,
    changeUserRole,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  }
}
