import type {
  LoyaltyBenefit,
  LoyaltyCheckoutPreview,
  LoyaltyHistoryItem,
  LoyaltyHistoryResponse,
  LoyaltyProfile,
  LoyaltyTier,
} from './loyalty.types'
import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'
import { mockGetAchievementsPreview } from '@/features/loyalty/achievements/achievements.mock'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    label: 'Bronze',
    minPoints: 0,
    maxPoints: 1499,
    badgeColor: '#b45309',
    benefits: ['3% кешбек на квитки', 'Базові бонуси на день народження'],
  },
  {
    id: 'silver',
    label: 'Silver',
    minPoints: 1500,
    maxPoints: 3999,
    badgeColor: '#94a3b8',
    benefits: ['7% кешбек', 'Пріоритетне бронювання'],
  },
  {
    id: 'gold',
    label: 'Gold',
    minPoints: 4000,
    badgeColor: '#f59e0b',
    benefits: ['12% кешбек', 'Преміальні бонуси', 'VIP підтримка'],
  },
]

const BENEFITS: LoyaltyBenefit[] = [
  {
    id: 'benefit-001',
    title: 'Кешбек на квитки',
    description: 'Нарахування балів за кожне бронювання.',
    tier: 'bronze',
  },
  {
    id: 'benefit-002',
    title: 'Пріоритетне бронювання',
    description: 'Доступ до найкращих місць на 1 годину раніше.',
    tier: 'silver',
  },
  {
    id: 'benefit-003',
    title: 'Преміальний сервіс',
    description: 'Персональні бонуси та VIP пропозиції.',
    tier: 'gold',
  },
]

const HISTORY: LoyaltyHistoryItem[] = [
  {
    id: 'hist-001',
    date: '2026-05-12T19:30:00.000Z',
    type: 'earn',
    points: 120,
    description: 'Бронювання квитків на 2 місця',
    orderId: 'ORD-91A2D4F1',
  },
  {
    id: 'hist-002',
    date: '2026-05-05T18:00:00.000Z',
    type: 'bonus',
    points: 200,
    description: 'Бонус за відвідування премʼєри',
  },
  {
    id: 'hist-003',
    date: '2026-04-28T20:10:00.000Z',
    type: 'redeem',
    points: -150,
    description: 'Знижка на комбо у кінобарі',
  },
  {
    id: 'hist-004',
    date: '2026-04-20T21:30:00.000Z',
    type: 'earn',
    points: 90,
    description: 'Бронювання квитків на 1 місце',
    orderId: 'ORD-5C90A8B2',
  },
  {
    id: 'hist-005',
    date: '2026-04-01T10:00:00.000Z',
    type: 'expire',
    points: -50,
    description: 'Закінчення терміну дії балів',
  },
  {
    id: 'hist-006',
    date: '2026-03-22T17:15:00.000Z',
    type: 'earn',
    points: 140,
    description: 'Квитки на IMAX сеанс',
    orderId: 'ORD-7BD0A17C',
  },
  {
    id: 'hist-007',
    date: '2026-03-12T19:45:00.000Z',
    type: 'earn',
    points: 110,
    description: 'Бронювання квитків на 2 місця',
    orderId: 'ORD-6F2C1A2B',
  },
  {
    id: 'hist-008',
    date: '2026-02-28T21:10:00.000Z',
    type: 'redeem',
    points: -200,
    description: 'Обмін балів на VIP місця',
  },
  {
    id: 'hist-009',
    date: '2026-02-14T20:00:00.000Z',
    type: 'bonus',
    points: 180,
    description: 'Святковий бонус',
  },
  {
    id: 'hist-010',
    date: '2026-01-30T19:20:00.000Z',
    type: 'earn',
    points: 95,
    description: 'Вечірній сеанс',
    orderId: 'ORD-1B9A7D2C',
  },
  {
    id: 'hist-011',
    date: '2026-01-12T18:10:00.000Z',
    type: 'earn',
    points: 130,
    description: 'Бронювання квитків на 2 місця',
    orderId: 'ORD-4DE2A6C1',
  },
  {
    id: 'hist-012',
    date: '2025-12-28T21:30:00.000Z',
    type: 'redeem',
    points: -100,
    description: 'Обмін на подарунок у кінобарі',
  },
]

export async function mockGetLoyaltyProfile(): Promise<LoyaltyProfile> {
  await delay(400)

  return {
    userId: 'user-123',
    pointsBalance: 2350,
    tier: TIERS[1],
    nextTier: TIERS[2],
    progressPercent: 52,
    visitsCount: 8,
    yearlyPoints: 2350,
    pointsExpiryDate: '2026-12-31',
    isBirthdayMonth: false,
    birthdayBonusPoints: 250,
  }
}

export async function mockGetLoyaltyHistory(
  page: number,
  pageSize: number,
): Promise<LoyaltyHistoryResponse> {
  await delay(450)

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    items: HISTORY.slice(start, end),
    page,
    pageSize,
    total: HISTORY.length,
  }
}

export async function mockGetLoyaltyBenefits(): Promise<LoyaltyBenefit[]> {
  await delay(320)
  return BENEFITS
}

export async function mockGetLoyaltyAchievementsPreview(): Promise<AchievementsPreviewData> {
  return mockGetAchievementsPreview()
}

export async function mockGetCheckoutLoyaltyPreview(
  orderTotal: number,
): Promise<LoyaltyCheckoutPreview> {
  await delay(300)

  const availablePoints = 2350
  const maxRedeemablePoints = Math.min(availablePoints, Math.round(orderTotal * 15))
  const discountValue = Math.round(maxRedeemablePoints * 0.05)

  return {
    orderTotal,
    availablePoints,
    maxRedeemablePoints,
    discountValue,
    isRedemptionAvailable: false,
    helperText:
      'Редемпшн балів буде доступний після підключення бекенду.',
  }
}

export { TIERS }
