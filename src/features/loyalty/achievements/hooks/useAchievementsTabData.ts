import { useQuery } from '@tanstack/react-query'

import { achievementsService } from '@/features/loyalty/achievements/achievements.service'

export const useAchievementsTabData = () => {
  return useQuery({
    queryKey: ['achievements-tab'],
    queryFn: () => achievementsService.getAchievementsTabData(),
    staleTime: 10 * 60 * 1000,
  })
}
