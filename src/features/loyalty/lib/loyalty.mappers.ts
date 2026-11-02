import type {
  BackendLoyaltyProfileDto,
  LoyaltyProfile,
  LoyaltyTier,
} from '../model/loyalty.types'

const TIER_LABELS: Record<LoyaltyTier['id'], LoyaltyTier['label']> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  unknown: 'Рівень невідомий',
}

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max)

export const resolveTierKey = (
  tier?: string | number | null,
): LoyaltyTier['id'] => {
  const normalized = String(tier ?? '')
    .trim()
    .toLowerCase()
    .replace(/^tier_/, '')

  if (normalized === 'gold' || normalized === '3') return 'gold'
  if (normalized === 'silver' || normalized === '2') return 'silver'
  if (normalized === 'bronze' || normalized === '1') return 'bronze'
  return 'unknown'
}

export const createTier = (tier?: string | number | null): LoyaltyTier => {
  const key = resolveTierKey(tier)
  return { id: key, label: TIER_LABELS[key] }
}

export const getNextTierKey = (tier: LoyaltyTier['id']) => {
  if (tier === 'bronze') return 'silver'
  if (tier === 'silver') return 'gold'
  return undefined
}

const optionalMetric = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined

export const mapLoyaltyProfile = (
  data: BackendLoyaltyProfileDto,
): LoyaltyProfile => {
  const pointsBalance = data.balance ?? data.points
  if (!Number.isFinite(pointsBalance)) {
    throw new Error('Loyalty profile has no valid points balance')
  }
  const tier = createTier(data.tier)
  const nextTierKey = getNextTierKey(tier.id)

  return {
    pointsBalance,
    tier,
    nextTier: nextTierKey ? createTier(nextTierKey) : undefined,
    lifetimePoints: optionalMetric(data.lifetimePoints),
    yearPoints: optionalMetric(data.yearPoints),
    yearVisits: optionalMetric(data.yearVisits),
    tierExpiresAt: data.tierExpiresAt,
    balanceExpiresAt: data.balanceExpiresAt,
    isBirthdayWeek: data.isBirthdayWeek ?? false,
    goldUpgradeAvailable: data.goldUpgradeAvailable ?? false,
  }
}
