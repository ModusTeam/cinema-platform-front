export type LoyaltyTierKey = 'bronze' | 'silver' | 'gold'

export type ApiLoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | LoyaltyTierKey

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
	updatedAt?: string
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
	pointsToSpend?: number
	finalTotal?: number
	goldUpgradeAvailable?: boolean
	goldUpgradeLabel?: string
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

export interface LoyaltyProfileDto {
	userId?: string
	pointsBalance?: number
	points?: number
	balance?: number
	tier?: ApiLoyaltyTier
	nextTier?: ApiLoyaltyTier
	progressPercent?: number
	visitsCount?: number
	visits?: number
	yearlyPoints?: number
	lifetimePoints?: number
	pointsExpiryDate?: string
	isBirthdayMonth?: boolean
	birthdayBonusPoints?: number
	birthdayBonusClaimed?: boolean
	goldUpgradeAvailable?: boolean
	updatedAt?: string
}

export interface LoyaltyBenefitDto {
	id?: string
	title?: string
	name?: string
	description?: string
	tier?: ApiLoyaltyTier
}

export interface LoyaltyHistoryItemDto {
	id?: string
	date?: string
	createdAt?: string
	type?: LoyaltyHistoryType | string
	action?: string
	points?: number
	amount?: number
	description?: string
	reason?: string
	orderId?: string
}

export interface LoyaltyHistoryResponseDto {
	items?: LoyaltyHistoryItemDto[]
	data?: LoyaltyHistoryItemDto[]
	page?: number
	pageSize?: number
	total?: number
}

export interface LoyaltyCheckoutPreviewDto {
	orderTotal?: number
	availablePoints?: number
	pointsBalance?: number
	maxRedeemablePoints?: number
	pointsToSpend?: number
	discountValue?: number
	discountAmount?: number
	finalTotal?: number
	isRedemptionAvailable?: boolean
	helperText?: string
	message?: string
	goldUpgradeAvailable?: boolean
	goldUpgradeLabel?: string
}
