export type LoyaltyTierKey = 'bronze' | 'silver' | 'gold'

export type LoyaltyTierLabel = 'Bronze' | 'Silver' | 'Gold'

export interface LoyaltyTier {
  id: LoyaltyTierKey | 'unknown'
  label: LoyaltyTierLabel | 'Рівень невідомий'
}

export interface BackendLoyaltyProfileDto {
  balance?: number
  points: number
  tier: string | number
  lifetimePoints?: number
  yearPoints?: number
  yearVisits?: number
  tierExpiresAt?: string | null
  balanceExpiresAt?: string | null
  isBirthdayWeek?: boolean
  goldUpgradeAvailable?: boolean
}

export interface LoyaltyProfile {
  pointsBalance: number
  tier: LoyaltyTier
  nextTier?: LoyaltyTier
  lifetimePoints?: number
  yearPoints?: number
  yearVisits?: number
  tierExpiresAt?: string | null
  balanceExpiresAt?: string | null
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
