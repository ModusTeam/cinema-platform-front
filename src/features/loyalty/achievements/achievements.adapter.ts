import { clamp } from '@/features/loyalty/api/loyalty.mappers'
import { api } from '@/lib/axios'

import type {
  Achievement,
  AchievementCategoryKey,
  AchievementRarityKey,
  AchievementStrategyKey,
  AchievementsPreviewData,
  AchievementsTabData,
  BackendGetUserAchievementsResponse,
  BackendUserAchievementDto,
} from './achievements.types'

const CATEGORY_LABELS: Record<AchievementCategoryKey, string> = {
  unspecified: 'Інше',
  visits: 'Візити',
  spending: 'Витрати',
  tier: 'Рівень',
  time: 'Час',
  special: 'Спеціальні',
  streak: 'Серія',
  secret: 'Секретні',
}

const RARITY_LABELS: Record<AchievementRarityKey, string> = {
  unspecified: 'Звичайне',
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

const STRATEGY_LABELS: Record<AchievementStrategyKey, string> = {
  unspecified: 'Інше',
  instant: 'Миттєве',
  threshold: 'Прогрес',
  streak: 'Серія',
}

const resolveCategory = (value: number | string): AchievementCategoryKey => {
  const normalized = String(value).trim().toLowerCase()

  if (normalized === '1' || normalized.includes('visits')) return 'visits'
  if (normalized === '2' || normalized.includes('spending')) return 'spending'
  if (normalized === '3' || normalized.includes('tier')) return 'tier'
  if (normalized === '4' || normalized.includes('time')) return 'time'
  if (normalized === '5' || normalized.includes('special')) return 'special'
  if (normalized === '6' || normalized.includes('streak')) return 'streak'
  if (normalized === '7' || normalized.includes('secret')) return 'secret'

  return 'unspecified'
}

const resolveRarity = (value: number | string): AchievementRarityKey => {
  const normalized = String(value).trim().toLowerCase()

  if (normalized === '1' || normalized.includes('common')) {
    if (normalized.includes('uncommon')) return 'uncommon'
    return 'common'
  }
  if (normalized === '2' || normalized.includes('uncommon')) return 'uncommon'
  if (normalized === '3' || normalized.includes('rare')) return 'rare'
  if (normalized === '4' || normalized.includes('epic')) return 'epic'
  if (normalized === '5' || normalized.includes('legendary')) return 'legendary'

  return 'unspecified'
}

const resolveStrategy = (value: number | string): AchievementStrategyKey => {
  const normalized = String(value).trim().toLowerCase()

  if (normalized === '1' || normalized.includes('instant')) return 'instant'
  if (normalized === '2' || normalized.includes('threshold')) return 'threshold'
  if (normalized === '3' || normalized.includes('streak')) return 'streak'

  return 'unspecified'
}

const normalizeAchievement = (item: BackendUserAchievementDto): Achievement => {
  const { achievement } = item
  const target = Math.max(item.target || 0, 0)
  const current = Math.max(item.current || 0, 0)
  const category = resolveCategory(achievement.category)
  const rarity = resolveRarity(achievement.rarity)
  const strategy = resolveStrategy(achievement.strategy)
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
    categoryLabel: CATEGORY_LABELS[category],
    rarity,
    rarityLabel: RARITY_LABELS[rarity],
    strategy,
    strategyLabel: STRATEGY_LABELS[strategy],
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
