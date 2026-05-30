import { api } from '@/lib/axios'

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

interface AdminLoyaltyTransactionsResponse {
  transactions: AdminLoyaltyTransaction[]
}

export const adminLoyaltyService = {
  getUserBalance: async (userId: string): Promise<AdminLoyaltyBalance> => {
    const { data } = await api.get(`/admin/loyalty/users/${userId}/balance`)
    return data
  },

  getTransactionHistory: async (
    userId: string,
    limit = 50,
    skip = 0,
  ): Promise<AdminLoyaltyTransaction[]> => {
    const { data } = await api.get<AdminLoyaltyTransactionsResponse>(
      `/admin/loyalty/users/${userId}/transactions`,
      { params: { limit, skip } },
    )
    return data.transactions
  },

  modifyPoints: async (userId: string, points: number, reason: string) => {
    const { data } = await api.post('/admin/loyalty/modify-points', {
      userId,
      points,
      reason,
    })
    return data
  },

  grantVipStatus: async (userId: string, reason: string) => {
    const { data } = await api.post(`/admin/loyalty/users/${userId}/vip`, {
      reason,
    })
    return data
  },
}
