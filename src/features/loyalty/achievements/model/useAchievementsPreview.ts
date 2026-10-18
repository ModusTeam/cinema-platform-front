import { useQuery } from '@tanstack/react-query'

import { achievementsService } from '@/features/loyalty/achievements/achievements.service'

export const useAchievementsPreview = () => {
  return useQuery({
    queryKey: ['achievements-preview'],
    queryFn: () => achievementsService.getAchievementsPreview(),
    staleTime: 10 * 60 * 1000,
  })
}
