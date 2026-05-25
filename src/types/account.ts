export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold'

export interface LoyaltyProfileDto {
  points: number
  tier: string | number
}

export interface UserProfileDto {
  id: string
  email: string
  firstName: string
  lastName: string
  loyaltyPoints: number
  loyaltyTier: LoyaltyTier
}
