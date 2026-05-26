import { clamp } from '@/features/loyalty/api/loyalty.mappers'
import { api } from '@/lib/axios'

import {
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
  getAchievementStrategyLabel,
  resolveAchievementCategory,
  resolveAchievementRarity,
  resolveAchievementStrategy,
} from './achievementContract'
import type {
  Achievement,
  AchievementsPreviewData,
  AchievementsTabData,
  BackendGetUserAchievementsResponse,
  BackendUserAchievementDto,
} from './achievements.types'

const normalizeAchievement = (item: BackendUserAchievementDto): Achievement => {
  const { achievement } = item
  const target = Math.max(item.target || 0, 0)
  const current = Math.max(item.current || 0, 0)
  const category = resolveAchievementCategory(achievement.category)
  const rarity = resolveAchievementRarity(achievement.rarity)
  const strategy = resolveAchievementStrategy(achievement.strategy)
  const progressPercent = target > 0 ? clamp((current / target) * 100) : 0

  return {
    id: achievement.id,
    code: achievement.code,
    title: achievement.name,
    description: achievement.description,
    status: item.isUnlocked
      ? 'unlocked'
      : current > 0
        ? 'in-progress'
        : 'locked',
    category,
    categoryLabel: getAchievementCategoryLabel(achievement.category),
    rarity,
    rarityLabel: getAchievementRarityLabel(achievement.rarity),
    strategy,
    strategyLabel: getAchievementStrategyLabel(achievement.strategy),
    current,
    target,
    progressPercent,
    pointsReward: achievement.rewardPoints,
    isSecret: achievement.isSecret,
    secretHint: achievement.secretHint,
    icon: achievement.icon,
    unlockedAt: item.unlockedAt,
    sortOrder: achievement.sortOrder,
  }
}

const getUserAchievements = async (): Promise<Achievement[]> => {
  const { data } = await api.get<BackendGetUserAchievementsResponse>(
    '/achievements/me',
    {
      params: { includeLocked: true },
    },
  )

  return data.achievements
    .map(normalizeAchievement)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const achievementsAdapter = {
  getAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
    const achievements = await getUserAchievements()
    const unlocked = achievements.filter(item => item.status === 'unlocked')

    return {
      totalUnlocked: unlocked.length,
      totalAvailable: achievements.length,
      items: achievements.slice(0, 3),
    }
  },

  getAchievementsTabData: async (): Promise<AchievementsTabData> => {
    const achievements = await getUserAchievements()

    return {
      summary: {
        unlocked: achievements.filter(item => item.status === 'unlocked')
          .length,
        inProgress: achievements.filter(item => item.status === 'in-progress')
          .length,
        locked: achievements.filter(item => item.status === 'locked').length,
        total: achievements.length,
      },
      achievements,
    }
  },
}
