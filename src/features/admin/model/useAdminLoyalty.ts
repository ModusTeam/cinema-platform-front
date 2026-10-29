import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { adminLoyaltyService } from '@/features/admin/api/admin-loyalty.service'

export const useAdminLoyalty = (userId?: string | null) => {
  const queryClient = useQueryClient()

  const balanceQuery = useQuery({
    queryKey: ['admin-loyalty-balance', userId],
    queryFn: () => {
      if (!userId) throw new Error('Оберіть користувача')
      return adminLoyaltyService.getUserBalance(userId)
    },
    enabled: !!userId,
  })

  const historyQuery = useQuery({
    queryKey: ['admin-loyalty-history', userId],
    queryFn: () => {
      if (!userId) throw new Error('Оберіть користувача')
      return adminLoyaltyService.getTransactionHistory(userId)
    },
    enabled: !!userId,
  })

  const modifyMutation = useMutation({
    mutationFn: (data: { userId: string; points: number; reason: string }) =>
      adminLoyaltyService.modifyPoints(data.userId, data.points, data.reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-loyalty-balance', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin-loyalty-history', variables.userId],
      })
    },
  })

  return {
    balance: balanceQuery.data,
    isLoadingBalance: balanceQuery.isLoading,
    isBalanceError: balanceQuery.isError,
    refetchBalance: balanceQuery.refetch,
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    isHistoryError: historyQuery.isError,
    refetchHistory: historyQuery.refetch,
    modifyPoints: modifyMutation.mutateAsync,
    isModifying: modifyMutation.isPending,
  }
}
