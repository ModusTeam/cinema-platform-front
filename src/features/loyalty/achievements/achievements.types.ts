export type AchievementStatus = 'unlocked' | 'in-progress' | 'locked'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  title: string
  description: string
  status: AchievementStatus
  rarity: AchievementRarity
  progress?: number
  total?: number
  pointsReward?: number
  category?: string
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

export interface AchievementDto {
  id?: string
  title?: string
  name?: string
  description?: string
  status?: AchievementStatus | string
  rarity?: AchievementRarity | string
  progress?: number
  currentProgress?: number
  total?: number
  targetValue?: number
  pointsReward?: number
  rewardPoints?: number
  category?: string
}

export interface AchievementsResponseDto {
  items?: AchievementDto[]
  achievements?: AchievementDto[]
  data?: AchievementDto[]
}
