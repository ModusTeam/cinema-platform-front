import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { accountService } from '@/services/accountService'

export const useLoyalty = () => {
	const { isAuthenticated } = useAuth()

	return useQuery({
		queryKey: ['account-loyalty'],
		queryFn: accountService.getLoyaltyProfile,
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	})
}
