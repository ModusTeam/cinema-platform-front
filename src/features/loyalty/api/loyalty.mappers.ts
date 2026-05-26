import { LOYALTY_TIER_THRESHOLDS } from '@/constants/loyalty'

import type {
  BackendLoyaltyProfileDto,
  LoyaltyProfile,
  LoyaltyTier,
  LoyaltyTierKey,
} from './loyalty.types'

const TIER_LABELS: Record<LoyaltyTierKey, LoyaltyTier['label']> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
}

const TIER_COLORS: Record<LoyaltyTierKey, string> = {
  bronze: '#b45309',
  silver: '#94a3b8',
  gold: '#f59e0b',
}

const TIER_BENEFITS: Record<LoyaltyTierKey, string[]> = {
  bronze: ['Базова участь у програмі лояльності'],
  silver: ['Вищий статус після досягнення порогу балів'],
  gold: ['Преміальний статус програми лояльності'],
}

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max)

export const resolveTierKey = (
  tier?: string | number | null,
  points = 0,
): LoyaltyTierKey => {
  if (typeof tier === 'number') {
    if (tier === 3) return 'gold'
    if (tier === 2) return 'silver'
    if (tier === 1) return 'bronze'
  }

  const normalized = String(tier ?? '')
    .trim()
    .toLowerCase()
    .replace(/^tier_/, '')

  if (normalized === 'gold' || normalized === '3') return 'gold'
  if (normalized === 'silver' || normalized === '2') return 'silver'
  if (normalized === 'bronze' || normalized === '1') return 'bronze'

  if (points >= LOYALTY_TIER_THRESHOLDS.GOLD.points) return 'gold'
  if (points >= LOYALTY_TIER_THRESHOLDS.SILVER.points) return 'silver'
  return 'bronze'
}

export const createTier = (
  tier?: string | number | null,
  points = 0,
): LoyaltyTier => {
  const key = resolveTierKey(tier, points)

  return {
    id: key,
    label: TIER_LABELS[key],
    minPoints:
      key === 'gold'
        ? LOYALTY_TIER_THRESHOLDS.GOLD.points
        : key === 'silver'
          ? LOYALTY_TIER_THRESHOLDS.SILVER.points
          : 0,
    maxPoints:
      key === 'bronze'
        ? LOYALTY_TIER_THRESHOLDS.SILVER.points - 1
        : key === 'silver'
          ? LOYALTY_TIER_THRESHOLDS.GOLD.points - 1
          : undefined,
    badgeColor: TIER_COLORS[key],
    benefits: TIER_BENEFITS[key],
  }
}

export const getNextTierKey = (tier: LoyaltyTierKey) => {
  if (tier === 'bronze') return 'silver'
  if (tier === 'silver') return 'gold'
  return undefined
}

export const getTierProgressPercent = (
  tier: LoyaltyTierKey,
  points: number,
) => {
  const nextTierKey = getNextTierKey(tier)

  if (!nextTierKey) return 100

  const target =
    nextTierKey === 'silver'
      ? LOYALTY_TIER_THRESHOLDS.SILVER.points
      : LOYALTY_TIER_THRESHOLDS.GOLD.points

  return clamp((points / target) * 100)
}

export const mapLoyaltyProfile = (
  data: BackendLoyaltyProfileDto,
): LoyaltyProfile => {
  const pointsBalance = data.balance ?? data.points ?? 0
  const tier = createTier(data.tier, pointsBalance)
  const nextTierKey = getNextTierKey(tier.id)

  return {
    pointsBalance,
    tier,
    nextTier: nextTierKey ? createTier(nextTierKey) : undefined,
    progressPercent: getTierProgressPercent(tier.id, pointsBalance),
    lifetimePoints: data.lifetimePoints ?? pointsBalance,
    yearPoints: data.yearPoints ?? 0,
    yearVisits: data.yearVisits ?? 0,
    tierExpiresAt: data.tierExpiresAt,
    balanceExpiresAt: data.balanceExpiresAt,
    isBirthdayWeek: data.isBirthdayWeek ?? false,
    goldUpgradeAvailable: data.goldUpgradeAvailable ?? false,
  }
}
