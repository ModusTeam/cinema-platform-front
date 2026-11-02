import { useQuery } from '@tanstack/react-query'

import { achievementsService } from '@/features/loyalty/achievements/achievements.service'
import { useAuth } from '@/features/auth/model/AuthContext'
import { achievementQueryScope } from './achievementQuery'

export const useAchievementsTabData = () => {
  const { user } = useAuth()
  return useQuery({
    ...achievementQueryScope('achievements-tab', user?.id),
    queryFn: () => achievementsService.getAchievementsTabData(),
    staleTime: 10 * 60 * 1000,
  })
}
