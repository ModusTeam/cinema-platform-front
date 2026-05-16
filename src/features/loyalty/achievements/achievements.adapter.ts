import type {
  AchievementsPreviewData,
  AchievementsTabData,
} from './achievements.types'
import {
  mockGetAchievementsPreview,
  mockGetAchievementsTabData,
} from './achievements.mock'

const USE_MOCK = true

export const achievementsAdapter = {
  getAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
    if (USE_MOCK) return mockGetAchievementsPreview()
    // NOTE: backend integration point
    throw new Error('Achievements backend is not connected yet')
  },
  getAchievementsTabData: async (): Promise<AchievementsTabData> => {
    if (USE_MOCK) return mockGetAchievementsTabData()
    // NOTE: backend integration point
    throw new Error('Achievements backend is not connected yet')
  },
}
