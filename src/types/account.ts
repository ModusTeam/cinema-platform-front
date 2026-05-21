export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold'

export interface LoyaltyProfileDto {
	points: number
	tier: LoyaltyTier
}

export interface UserProfileDto {
	id: string
	email: string
	firstName: string
	lastName: string
	loyaltyPoints: number
	loyaltyTier: LoyaltyTier
}
