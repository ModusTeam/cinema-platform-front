import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { adminLoyaltyService } from '@/features/admin/api/admin-loyalty.service'

export const useAdminLoyalty = (userId?: string | null) => {
	const queryClient = useQueryClient()

	const balanceQuery = useQuery({
		queryKey: ['admin-loyalty-balance', userId],
		queryFn: () => adminLoyaltyService.getUserBalance(userId!),
		enabled: !!userId,
	})

	const historyQuery = useQuery({
		queryKey: ['admin-loyalty-history', userId],
		queryFn: () => adminLoyaltyService.getTransactionHistory(userId!),
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
		history: historyQuery.data,
		isLoadingHistory: historyQuery.isLoading,
		modifyPoints: modifyMutation.mutateAsync,
		isModifying: modifyMutation.isPending,
	}
}
