export type AchievementStatus = 'unlocked' | 'in-progress' | 'locked'

export type AchievementCategoryKey =
  | 'visits'
  | 'spending'
  | 'tier'
  | 'time'
  | 'special'
  | 'streak'
  | 'secret'
  | 'unspecified'

export type AchievementRarityKey =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'unspecified'

export type AchievementStrategyKey =
  | 'instant'
  | 'threshold'
  | 'streak'
  | 'unspecified'

export interface Achievement {
  id: string
  code: string
  title: string
  description: string
  status: AchievementStatus
  category: AchievementCategoryKey
  categoryLabel: string
  rarity: AchievementRarityKey
  rarityLabel: string
  strategy: AchievementStrategyKey
  strategyLabel: string
  current: number
  target: number
  progressPercent: number
  pointsReward: number
  isSecret: boolean
  secretHint?: string
  icon?: string
  unlockedAt?: string
  sortOrder: number
}

export interface AchievementsPreviewData {
  totalUnlocked: number
  totalAvailable: number
  items: Achievement[]
}

export interface AchievementsTabData {
  summary: {
    unlocked: number
    inProgress: number
    locked: number
    total: number
  }
  achievements: Achievement[]
}

export interface BackendAchievementDto {
  id: string
  code: string
  name: string
  description: string
  secretHint?: string
  isSecret: boolean
  icon: string
  category: number | string
  rarity: number | string
  strategy: number | string
  criteriaJson: string
  rewardPoints: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BackendUserAchievementDto {
  achievement: BackendAchievementDto
  current: number
  target: number
  isUnlocked: boolean
  unlockedAt?: string
}

export interface BackendGetUserAchievementsResponse {
  achievements: BackendUserAchievementDto[]
}
