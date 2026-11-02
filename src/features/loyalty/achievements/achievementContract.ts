import type {
  AchievementCategoryKey,
  AchievementRarityKey,
  AchievementStrategyKey,
} from './achievements.types'

export const ACHIEVEMENT_CATEGORY_OPTIONS = [
  { value: 1, key: 'visits', label: 'Візити' },
  { value: 2, key: 'spending', label: 'Витрати' },
  { value: 3, key: 'tier', label: 'Рівень' },
  { value: 4, key: 'time', label: 'Час' },
  { value: 5, key: 'special', label: 'Спеціальні' },
  { value: 6, key: 'streak', label: 'Серія' },
  { value: 7, key: 'secret', label: 'Секретні' },
] as const

export const ACHIEVEMENT_RARITY_OPTIONS = [
  { value: 1, key: 'common', label: 'Звичайне' },
  { value: 2, key: 'uncommon', label: 'Незвичайне' },
  { value: 3, key: 'rare', label: 'Рідкісне' },
  { value: 4, key: 'epic', label: 'Епічне' },
  { value: 5, key: 'legendary', label: 'Легендарне' },
] as const

export const ACHIEVEMENT_STRATEGY_OPTIONS = [
  { value: 1, key: 'instant', label: 'Миттєве' },
  { value: 2, key: 'threshold', label: 'Прогрес' },
  { value: 3, key: 'streak', label: 'Серія' },
] as const

const normalizeEnumText = (value: number | string) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/^achievement_(category|rarity|strategy)_/, '')

export const resolveAchievementCategory = (
  value: number | string,
): AchievementCategoryKey => {
  const normalized = normalizeEnumText(value)
  const option = ACHIEVEMENT_CATEGORY_OPTIONS.find(
    item => String(item.value) === normalized || item.key === normalized,
  )

  return option?.key ?? 'unspecified'
}

export const resolveAchievementRarity = (
  value: number | string,
): AchievementRarityKey => {
  const normalized = normalizeEnumText(value)
  const option = ACHIEVEMENT_RARITY_OPTIONS.find(
    item => String(item.value) === normalized || item.key === normalized,
  )

  return option?.key ?? 'unspecified'
}

export const resolveAchievementStrategy = (
  value: number | string,
): AchievementStrategyKey => {
  const normalized = normalizeEnumText(value)
  const option = ACHIEVEMENT_STRATEGY_OPTIONS.find(
    item => String(item.value) === normalized || item.key === normalized,
  )

  return option?.key ?? 'unspecified'
}

export const getAchievementCategoryLabel = (value: number | string) => {
  const key = resolveAchievementCategory(value)
  return (
    ACHIEVEMENT_CATEGORY_OPTIONS.find(item => item.key === key)?.label || 'Інше'
  )
}

export const getAchievementRarityLabel = (value: number | string) => {
  const key = resolveAchievementRarity(value)
  return (
    ACHIEVEMENT_RARITY_OPTIONS.find(item => item.key === key)?.label ||
    'Звичайне'
  )
}

export const getAchievementStrategyLabel = (value: number | string) => {
  const key = resolveAchievementStrategy(value)
  return (
    ACHIEVEMENT_STRATEGY_OPTIONS.find(item => item.key === key)?.label || 'Інше'
  )
}
