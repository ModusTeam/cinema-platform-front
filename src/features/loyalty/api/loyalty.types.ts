export type LoyaltyTierKey = 'bronze' | 'silver' | 'gold'

export type LoyaltyTierLabel = 'Bronze' | 'Silver' | 'Gold'

export interface LoyaltyTier {
  id: LoyaltyTierKey
  label: LoyaltyTierLabel
  minPoints: number
  maxPoints?: number
  badgeColor: string
  benefits: string[]
}

export interface BackendLoyaltyProfileDto {
  balance?: number
  points: number
  tier: string | number
  lifetimePoints?: number
  yearPoints?: number
  yearVisits?: number
  tierExpiresAt?: string
  balanceExpiresAt?: string
  isBirthdayWeek?: boolean
  goldUpgradeAvailable?: boolean
}

export interface LoyaltyProfile {
  pointsBalance: number
  tier: LoyaltyTier
  nextTier?: LoyaltyTier
  progressPercent: number
  lifetimePoints: number
  yearPoints: number
  yearVisits: number
  tierExpiresAt?: string
  balanceExpiresAt?: string
  isBirthdayWeek: boolean
  goldUpgradeAvailable: boolean
}

export interface LoyaltyTransaction {
  id: string
  type: string
  points: number
  balanceAfter: number
  orderId: string | null
  description: string
  createdAt: string
}

export interface LoyaltyTransactionHistory {
  transactions: LoyaltyTransaction[]
  totalCount: number
  limit: number
  skip: number
}

export interface LoyaltyBenefit {
  id: string
  title: string
  description: string
  tier: LoyaltyTierKey
}

export interface LoyaltyCheckoutPreview {
  orderTotal: number
  availablePoints: number
  maxRedeemablePoints: number
  discountValue: number
  isRedemptionAvailable: boolean
  helperText: string
  pointsToSpend?: number
  finalTotal?: number
  goldUpgradeAvailable?: boolean
  goldUpgradeLabel?: string
}
