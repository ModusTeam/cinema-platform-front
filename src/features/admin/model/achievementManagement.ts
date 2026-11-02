import type { QueryClient } from '@tanstack/react-query'
import {
  resolveAchievementCategory,
  resolveAchievementRarity,
} from '@/features/loyalty/achievements/achievementContract'
import type { AdminAchievementDto } from '../api/admin-achievements.service'

export const ACHIEVEMENTS_PAGE_SIZE = 20
export const achievementListKey = (
  page: number,
  pageSize: number,
  includeInactive: boolean,
) => ['admin-achievements', { page, pageSize, includeInactive }] as const
export const achievementPageOffset = (page: number, pageSize: number) =>
  (Math.max(1, page) - 1) * pageSize
export const lastAchievementPage = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize))

export async function invalidateAchievementQueries(client: QueryClient) {
  await Promise.all(
    [
      'admin-achievements',
      'achievements-tab',
      'achievements-preview',
      'loyalty-achievements-preview',
    ].map(prefix => client.invalidateQueries({ queryKey: [prefix] })),
  )
}

export interface AchievementPageFilters {
  search: string
  secret: 'all' | 'secret' | 'regular'
  status: 'active' | 'all' | 'inactive'
  category: string
  rarity: string
}
export const DEFAULT_ACHIEVEMENT_FILTERS: AchievementPageFilters = {
  search: '',
  secret: 'all',
  status: 'active',
  category: 'all',
  rarity: 'all',
}

// Only these loaded records are searched; total remains the server catalogue count.
export function filterAchievementPage(
  items: AdminAchievementDto[],
  filters: AchievementPageFilters,
) {
  const search = filters.search.trim().toLocaleLowerCase('uk-UA')
  return items.filter(
    item =>
      (!search ||
        `${item.name}\n${item.code}`
          .toLocaleLowerCase('uk-UA')
          .includes(search)) &&
      (filters.secret === 'all' ||
        item.isSecret === (filters.secret === 'secret')) &&
      (filters.status === 'all' ||
        item.isActive === (filters.status === 'active')) &&
      (filters.category === 'all' ||
        resolveAchievementCategory(item.category) === filters.category) &&
      (filters.rarity === 'all' ||
        resolveAchievementRarity(item.rarity) === filters.rarity),
  )
}
