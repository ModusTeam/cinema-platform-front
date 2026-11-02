import {
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
  getAchievementStrategyLabel,
  resolveAchievementCategory,
  resolveAchievementRarity,
  resolveAchievementStrategy,
} from '@/features/loyalty/achievements/achievementContract'
import type {
  Achievement,
  AchievementStatus,
} from '@/features/loyalty/achievements/achievements.types'
import type { AchievementFormData } from './achievementForm'

export function buildAchievementPreview(
  values: AchievementFormData,
  status: AchievementStatus,
  guestView: boolean,
): Achievement {
  // Guest view always represents a visitor who has not discovered the secret.
  const masked = guestView && values.isSecret
  const simulatedStatus = masked ? 'locked' : status
  const inProgress = simulatedStatus === 'in-progress'
  return {
    id: 'editor-preview',
    code: values.code,
    title: values.name || 'Назва досягнення',
    description: values.description || 'Тут з’явиться опис вашого досягнення.',
    icon: values.icon,
    category: resolveAchievementCategory(values.category),
    categoryLabel: getAchievementCategoryLabel(values.category),
    rarity: resolveAchievementRarity(values.rarity),
    rarityLabel: getAchievementRarityLabel(values.rarity),
    strategy: resolveAchievementStrategy(values.strategy),
    strategyLabel: getAchievementStrategyLabel(values.strategy),
    pointsReward: Number.isFinite(values.rewardPoints)
      ? values.rewardPoints
      : 0,
    isSecret: masked,
    secretHint: values.secretHint,
    sortOrder: values.sortOrder,
    status: simulatedStatus,
    current: inProgress ? 35 : 0,
    target: inProgress ? 100 : 0,
    progressPercent: inProgress ? 35 : 0,
  }
}
