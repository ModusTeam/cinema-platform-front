import { useQuery } from '@tanstack/react-query'

import { achievementsService } from '@/features/loyalty/achievements/achievements.service'
import { useAuth } from '@/features/auth/model/AuthContext'
import { achievementQueryScope } from './achievementQuery'

export const useAchievementsPreview = () => {
  const { user } = useAuth()
  return useQuery({
    ...achievementQueryScope('achievements-preview', user?.id),
    queryFn: () => achievementsService.getAchievementsPreview(),
    staleTime: 10 * 60 * 1000,
  })
}
