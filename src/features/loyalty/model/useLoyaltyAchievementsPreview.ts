import { useQuery } from '@tanstack/react-query'

import { loyaltyService } from '@/features/loyalty/api/loyalty.service'

export const useLoyaltyAchievementsPreview = () => {
  return useQuery({
    queryKey: ['loyalty-achievements-preview'],
    queryFn: () => loyaltyService.getLoyaltyAchievementsPreview(),
    staleTime: 10 * 60 * 1000,
  })
}
