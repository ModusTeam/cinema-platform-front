export interface AdminLoyaltyBalance {
	balance: number
	tier: string
	lifetimePoints: number
}

export interface AdminLoyaltyTransaction {
	id: string
	type: string
	points: number
	balanceAfter: number
	description: string
	createdAt: string
	orderId?: string
}

import { loyaltyApi } from '@/lib/loyaltyApi'

export const adminLoyaltyService = {
	getUserBalance: async (userId: string): Promise<AdminLoyaltyBalance> => {
		const { data } = await loyaltyApi.get(
			`/admin/loyalty/users/${userId}/balance`,
		)
		return data
	},

	getTransactionHistory: async (
		userId: string,
		limit = 50,
		skip = 0,
	): Promise<AdminLoyaltyTransaction[]> => {
		const { data } = await loyaltyApi.get(
			`/admin/loyalty/users/${userId}/transactions`,
			{ params: { limit, skip } },
		)
		return data
	},

	modifyPoints: async (userId: string, points: number, reason: string) => {
		const { data } = await loyaltyApi.post('/admin/loyalty/modify-points', {
			userId,
			points,
			reason,
		})
		return data
	},
}
