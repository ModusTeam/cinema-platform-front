export type LoyaltyTierKey = 'bronze' | 'silver' | 'gold'

export interface LoyaltyTier {
	id: LoyaltyTierKey
	label: string
	minPoints: number
	maxPoints?: number
	badgeColor: string
	benefits: string[]
}

export interface LoyaltyProfile {
	userId: string
	pointsBalance: number
	tier: LoyaltyTier
	nextTier?: LoyaltyTier
	progressPercent: number
	visitsCount: number
	yearlyPoints: number
	pointsExpiryDate?: string
	isBirthdayMonth: boolean
	birthdayBonusPoints?: number
	birthdayBonusClaimed?: boolean
	goldUpgradeAvailable?: boolean
}

export interface LoyaltyBenefit {
	id: string
	title: string
	description: string
	tier: LoyaltyTierKey
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

export interface LoyaltyCheckoutPreview {
	orderTotal: number
	availablePoints: number
	maxRedeemablePoints: number
	discountValue: number
	isRedemptionAvailable: boolean
	helperText: string
}

export interface BenefitSimulationInput {
	ticketsPerYear: number
	avgTicketPrice: number
	concessionsPerVisit: number
}

export interface BenefitSimulationResult {
	estimatedPoints: number
	estimatedTier: LoyaltyTierKey
	estimatedSavings: number
}
