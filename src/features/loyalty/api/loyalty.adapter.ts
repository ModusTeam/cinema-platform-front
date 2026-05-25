import { LOYALTY_TIER_THRESHOLDS } from '@/constants/loyalty'
import { achievementsAdapter } from '@/features/loyalty/achievements/achievements.adapter'
import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'
import { loyaltyApi } from '@/lib/loyaltyApi'
import type { AxiosResponse } from 'axios'

import type {
	LoyaltyBenefit,
	LoyaltyBenefitDto,
	LoyaltyCheckoutPreview,
	LoyaltyCheckoutPreviewDto,
	LoyaltyHistoryItem,
	LoyaltyHistoryItemDto,
	LoyaltyHistoryResponse,
	LoyaltyHistoryResponseDto,
	LoyaltyProfile,
	LoyaltyProfileDto,
	LoyaltyTier,
	LoyaltyTierKey,
} from './loyalty.types'

const TIER_CONFIG: Record<LoyaltyTierKey, Omit<LoyaltyTier, 'benefits'>> = {
	bronze: {
		id: 'bronze',
		label: 'Bronze',
		minPoints: 0,
		maxPoints: LOYALTY_TIER_THRESHOLDS.SILVER.points - 1,
		badgeColor: '#b45309',
	},
	silver: {
		id: 'silver',
		label: 'Silver',
		minPoints: LOYALTY_TIER_THRESHOLDS.SILVER.points,
		maxPoints: LOYALTY_TIER_THRESHOLDS.GOLD.points - 1,
		badgeColor: '#94a3b8',
	},
	gold: {
		id: 'gold',
		label: 'Gold',
		minPoints: LOYALTY_TIER_THRESHOLDS.GOLD.points,
		badgeColor: '#f59e0b',
	},
}

const TIER_BENEFITS: Record<LoyaltyTierKey, string[]> = {
	bronze: ['3% кешбек на квитки', 'Базові бонуси на день народження'],
	silver: ['7% кешбек', 'Пріоритетне бронювання'],
	gold: [
		'12% кешбек',
		'Преміальні бонуси',
		'1 безкоштовний gold upgrade на місяць',
	],
}

const isNotFoundError = (error: unknown) => {
	if (
		typeof error === 'object' &&
		error !== null &&
		'response' in error &&
		typeof error.response === 'object' &&
		error.response !== null &&
		'status' in error.response
	) {
		return error.response.status === 404
	}

	return false
}

const requestFirstAvailable = async <T>(
	requests: Array<() => Promise<AxiosResponse<T>>>,
) => {
	let lastError: unknown

	for (const request of requests) {
		try {
			const response = await request()
			return response.data
		} catch (error) {
			lastError = error
			if (!isNotFoundError(error)) {
				throw error
			}
		}
	}

	throw lastError
}

const resolveTierKey = (tier?: string, points = 0): LoyaltyTierKey => {
	const normalizedTier = tier?.toLowerCase()

	if (
		normalizedTier === 'bronze' ||
		normalizedTier === 'silver' ||
		normalizedTier === 'gold'
	) {
		return normalizedTier
	}

	if (points >= LOYALTY_TIER_THRESHOLDS.GOLD.points) return 'gold'
	if (points >= LOYALTY_TIER_THRESHOLDS.SILVER.points) return 'silver'
	return 'bronze'
}

const createTier = (tier?: string, points = 0): LoyaltyTier => {
	const key = resolveTierKey(tier, points)

	return {
		...TIER_CONFIG[key],
		benefits: TIER_BENEFITS[key],
	}
}

const normalizeHistoryType = (
	type?: string,
	points = 0,
): LoyaltyHistoryItem['type'] => {
	const normalizedType = type?.toLowerCase()

	if (
		normalizedType === 'earn' ||
		normalizedType === 'redeem' ||
		normalizedType === 'expire' ||
		normalizedType === 'bonus'
	) {
		return normalizedType
	}

	if (normalizedType === 'refund') return 'bonus'
	return points < 0 ? 'redeem' : 'earn'
}

const normalizeHistoryItem = (
	item: LoyaltyHistoryItemDto,
	index: number,
): LoyaltyHistoryItem => {
	const points = item.points ?? item.amount ?? 0

	return {
		id: item.id || `loyalty-history-${index + 1}`,
		date: item.date || item.createdAt || new Date().toISOString(),
		type: normalizeHistoryType(item.type || item.action, points),
		points,
		description:
			item.description || item.reason || 'Операція лояльності без опису',
		orderId: item.orderId,
	}
}

const normalizeProfile = (data: LoyaltyProfileDto): LoyaltyProfile => {
	const pointsBalance = data.pointsBalance ?? data.points ?? data.balance ?? 0
	const yearlyPoints = data.yearlyPoints ?? data.lifetimePoints ?? pointsBalance
	const visitsCount = data.visitsCount ?? data.visits ?? 0
	const tier = createTier(data.tier, pointsBalance)
	const nextTierKey =
		tier.id === 'bronze' ? 'silver' : tier.id === 'silver' ? 'gold' : undefined
	const nextTier = nextTierKey
		? {
				...TIER_CONFIG[nextTierKey],
				benefits: TIER_BENEFITS[nextTierKey],
			}
		: undefined

	const threshold = nextTierKey
		? nextTierKey === 'silver'
			? LOYALTY_TIER_THRESHOLDS.SILVER.points
			: LOYALTY_TIER_THRESHOLDS.GOLD.points
		: Math.max(yearlyPoints, 1)

	return {
		userId: data.userId || 'current-user',
		pointsBalance,
		tier,
		nextTier,
		progressPercent:
			data.progressPercent ?? Math.min(100, (yearlyPoints / threshold) * 100),
		visitsCount,
		yearlyPoints,
		pointsExpiryDate: data.pointsExpiryDate,
		isBirthdayMonth: Boolean(data.isBirthdayMonth),
		birthdayBonusPoints: data.birthdayBonusPoints,
		birthdayBonusClaimed: data.birthdayBonusClaimed,
		goldUpgradeAvailable: data.goldUpgradeAvailable,
		updatedAt: data.updatedAt,
	}
}

const normalizeBenefits = (data: LoyaltyBenefitDto[]): LoyaltyBenefit[] =>
	data.map((item, index) => {
		const tierKey = resolveTierKey(item.tier)

		return {
			id: item.id || `benefit-${index + 1}`,
			title: item.title || item.name || 'Перевага',
			description: item.description || 'Опис переваги буде доступний пізніше.',
			tier: tierKey,
		}
	})

const normalizeCheckoutPreview = (
	data: LoyaltyCheckoutPreviewDto,
	orderTotal: number,
): LoyaltyCheckoutPreview => {
	const availablePoints = data.availablePoints ?? data.pointsBalance ?? 0
	const maxRedeemablePoints =
		data.maxRedeemablePoints ?? Math.min(availablePoints, Math.round(orderTotal))
	const discountValue = data.discountValue ?? data.discountAmount ?? 0
	const finalTotal =
		data.finalTotal ?? Math.max(orderTotal - discountValue, 0)

	return {
		orderTotal: data.orderTotal ?? orderTotal,
		availablePoints,
		maxRedeemablePoints,
		discountValue,
		isRedemptionAvailable:
			data.isRedemptionAvailable ?? maxRedeemablePoints > 0,
		helperText:
			data.helperText ||
			data.message ||
			'Система автоматично застосує доступну знижку під час оформлення.',
		pointsToSpend: data.pointsToSpend ?? maxRedeemablePoints,
		finalTotal,
		goldUpgradeAvailable: data.goldUpgradeAvailable,
		goldUpgradeLabel: data.goldUpgradeLabel,
	}
}

export const loyaltyAdapter = {
	getLoyaltyProfile: async (): Promise<LoyaltyProfile> => {
		const data = await requestFirstAvailable<LoyaltyProfileDto>([
			() => loyaltyApi.get('/loyalty/profile'),
			() => loyaltyApi.get('/api/loyalty/profile'),
			() => loyaltyApi.get('/loyalty/me'),
		])

		return normalizeProfile(data)
	},
	getLoyaltyHistory: async (
		page: number,
		pageSize: number,
	): Promise<LoyaltyHistoryResponse> => {
		const data = await requestFirstAvailable<
			LoyaltyHistoryResponseDto | LoyaltyHistoryItemDto[]
		>([
			() =>
				loyaltyApi.get('/loyalty/history', {
					params: { page, pageSize },
				}),
			() =>
				loyaltyApi.get('/api/loyalty/history', {
					params: { page, pageSize },
				}),
			() =>
				loyaltyApi.get('/loyalty/transactions', {
					params: { limit: pageSize, skip: (page - 1) * pageSize },
				}),
		])

		const response = Array.isArray(data) ? { items: data } : data
		const items = (response.items || response.data || []).map(normalizeHistoryItem)

		return {
			items,
			page: response.page ?? page,
			pageSize: response.pageSize ?? pageSize,
			total: response.total ?? items.length,
		}
	},
	getLoyaltyBenefits: async (): Promise<LoyaltyBenefit[]> => {
		try {
			const data = await requestFirstAvailable<LoyaltyBenefitDto[] | { items?: LoyaltyBenefitDto[] }>(
				[
					() => loyaltyApi.get('/loyalty/benefits'),
					() => loyaltyApi.get('/api/loyalty/benefits'),
				],
			)

			const items = Array.isArray(data) ? data : data.items || []
			return normalizeBenefits(items)
		} catch (error) {
			if (!isNotFoundError(error)) {
				throw error
			}

			return []
		}
	},
	getLoyaltyAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
		return achievementsAdapter.getAchievementsPreview()
	},
	getCheckoutLoyaltyPreview: async (
		orderTotal: number,
	): Promise<LoyaltyCheckoutPreview> => {
		const data = await requestFirstAvailable<LoyaltyCheckoutPreviewDto>([
			() =>
				loyaltyApi.post('/loyalty/discount-preview', {
					orderTotal,
				}),
			() =>
				loyaltyApi.post('/api/loyalty/discount-preview', {
					orderTotal,
				}),
			() =>
				loyaltyApi.post('/loyalty/checkout-preview', {
					orderTotal,
				}),
		])

		return normalizeCheckoutPreview(data, orderTotal)
	},
}
