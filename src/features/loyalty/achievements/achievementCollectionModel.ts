import {
  getAchievementPresentation,
  getAchievementProgress,
} from './achievementPresentation'
import type { Achievement, AchievementStatus } from './achievements.types'

export const ACHIEVEMENT_FILTERS: {
  value: 'all' | AchievementStatus
  label: string
}[] = [
  { value: 'all', label: 'Усі' },
  { value: 'unlocked', label: 'Відкрито' },
  { value: 'in-progress', label: 'У прогресі' },
  { value: 'locked', label: 'Ще не відкрито' },
]

// Filtering must not disclose a hidden achievement's actual category.
export function getCollectionCategory(item: Achievement) {
  return getAchievementPresentation(item).hidden
    ? { key: 'secret', label: 'Секретні' }
    : { key: item.category, label: item.categoryLabel }
}

export function filterAchievements(
  items: Achievement[],
  category: string,
  status: string,
) {
  return items.filter(
    item =>
      (category === 'all' || getCollectionCategory(item).key === category) &&
      (status === 'all' || item.status === status),
  )
}

export function selectFeaturedAchievement(items: Achievement[]) {
  // Tie-breaks keep the featured target stable across refetches.
  return items.reduce<Achievement | undefined>((nearest, item) => {
    const progress = getAchievementProgress(item)
    if (progress === null || progress <= 0) return nearest
    if (!nearest) return item
    const nearestProgress = getAchievementProgress(nearest) ?? 0
    if (progress !== nearestProgress)
      return progress > nearestProgress ? item : nearest
    if (item.sortOrder !== nearest.sortOrder)
      return item.sortOrder < nearest.sortOrder ? item : nearest
    return item.id < nearest.id ? item : nearest
  }, undefined)
}

export function achievementDetailsPath(id: string, search = '') {
  return `/profile/achievements/${encodeURIComponent(id)}${search}`
}
