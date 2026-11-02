import { useQuery } from '@tanstack/react-query'

import { loyaltyService } from '@/features/loyalty/api/loyalty.service'
import { useAuth } from '@/features/auth/model/AuthContext'
import { achievementQueryScope } from '../achievements/model/achievementQuery'

export const useLoyaltyAchievementsPreview = () => {
  const { user } = useAuth()
  return useQuery({
    ...achievementQueryScope('loyalty-achievements-preview', user?.id),
    queryFn: () => loyaltyService.getLoyaltyAchievementsPreview(),
    staleTime: 10 * 60 * 1000,
  })
}
