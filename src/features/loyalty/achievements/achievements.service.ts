import { achievementsAdapter } from './achievements.adapter'
import type {
  AchievementsPreviewData,
  AchievementsTabData,
} from './achievements.types'

export const achievementsService = {
  getAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
    return achievementsAdapter.getAchievementsPreview()
  },
  getAchievementsTabData: async (): Promise<AchievementsTabData> => {
    return achievementsAdapter.getAchievementsTabData()
  },
}
