import type {
  Achievement,
  AchievementsPreviewData,
  AchievementsTabData,
} from './achievements.types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achv-001',
    title: 'Перший похід',
    description: 'Забронюйте перший квиток.',
    status: 'unlocked',
    rarity: 'common',
    pointsReward: 100,
    category: 'Квитки',
  },
  {
    id: 'achv-002',
    title: 'Кіномарафон',
    description: 'Відвідайте 10 сеансів за рік.',
    status: 'in-progress',
    rarity: 'rare',
    progress: 6,
    total: 10,
    pointsReward: 300,
    category: 'Відвідування',
  },
  {
    id: 'achv-003',
    title: 'Фанат премʼєр',
    description: 'Подивіться 5 премʼєр у перший тиждень показу.',
    status: 'locked',
    rarity: 'epic',
    progress: 0,
    total: 5,
    pointsReward: 500,
    category: 'Події',
  },
  {
    id: 'achv-004',
    title: 'Попкорн-майстер',
    description: 'Зробіть 8 покупок у кінобарі.',
    status: 'in-progress',
    rarity: 'common',
    progress: 3,
    total: 8,
    pointsReward: 150,
    category: 'Кінобар',
  },
  {
    id: 'achv-005',
    title: 'Нічний сеанс',
    description: 'Відвідайте сеанс після 22:00.',
    status: 'locked',
    rarity: 'rare',
    progress: 0,
    total: 1,
    pointsReward: 200,
    category: 'Події',
  },
  {
    id: 'achv-006',
    title: 'VIP-гурман',
    description: 'Спробуйте VIP-места тричі.',
    status: 'locked',
    rarity: 'legendary',
    progress: 0,
    total: 3,
    pointsReward: 800,
    category: 'Комфорт',
  },
]

export async function mockGetAchievementsPreview(): Promise<AchievementsPreviewData> {
  await delay(350)

  const unlocked = MOCK_ACHIEVEMENTS.filter(a => a.status === 'unlocked')
  return {
    totalUnlocked: unlocked.length,
    totalAvailable: MOCK_ACHIEVEMENTS.length,
    items: MOCK_ACHIEVEMENTS.slice(0, 3),
  }
}

export async function mockGetAchievementsTabData(): Promise<AchievementsTabData> {
  await delay(450)

  const unlocked = MOCK_ACHIEVEMENTS.filter(a => a.status === 'unlocked')
  const inProgress = MOCK_ACHIEVEMENTS.filter(a => a.status === 'in-progress')
  const locked = MOCK_ACHIEVEMENTS.filter(a => a.status === 'locked')

  return {
    summary: {
      unlocked: unlocked.length,
      inProgress: inProgress.length,
      locked: locked.length,
      total: MOCK_ACHIEVEMENTS.length,
    },
    achievements: MOCK_ACHIEVEMENTS,
  }
}
