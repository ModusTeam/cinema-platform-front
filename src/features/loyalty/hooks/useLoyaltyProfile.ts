import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'

export const useLoyaltyProfile = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['loyalty-profile', user?.id],
    queryFn: () => loyaltyService.getLoyaltyProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}
