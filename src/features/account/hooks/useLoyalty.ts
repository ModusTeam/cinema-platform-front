import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'
import type { LoyaltyTier } from '@/types/account'

export const useLoyalty = () => {
	const { user, isAuthenticated } = useAuth()

	return useQuery({
		queryKey: ['loyalty-profile', user?.id],
		queryFn: loyaltyService.getLoyaltyProfile,
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
		select: data => ({
			points: data.pointsBalance,
			tier: `${data.tier.label}` as LoyaltyTier,
			goldUpgradeAvailable: data.goldUpgradeAvailable,
		}),
	})
}
