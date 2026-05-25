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
  points: number
  tier: string | number
}

export interface LoyaltyProfile {
  pointsBalance: number
  tier: LoyaltyTier
  nextTier?: LoyaltyTier
  progressPercent: number
}

export type LoyaltyHistoryType = 'earn' | 'redeem' | 'expire' | 'bonus'

export interface LoyaltyHistoryItem {
  id: string
  date: string
  type: LoyaltyHistoryType
  points: number
  description: string
  orderId?: string
}

export interface LoyaltyHistoryResponse {
  items: LoyaltyHistoryItem[]
  page: number
  pageSize: number
  total: number
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
