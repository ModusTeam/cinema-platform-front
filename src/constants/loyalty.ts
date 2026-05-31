export const LOYALTY_TIER_THRESHOLDS = {
  SILVER: { points: 2000, visits: 8 },
  GOLD: { points: 5000, visits: 20 },
} as const

export const LOYALTY_TIER_MULTIPLIERS = {
  Bronze: 1.0,
  Silver: 1.5,
  Gold: 2.0,
} as const

export const LOYALTY_MINIMUM_DEDUCTION = 75
