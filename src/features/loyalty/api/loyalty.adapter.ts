import { achievementsAdapter } from '@/features/loyalty/achievements/achievements.adapter'
import { api } from '@/lib/axios'

import { mapLoyaltyProfile } from './loyalty.mappers'
import type {
  BackendLoyaltyProfileDto,
  LoyaltyBenefit,
  LoyaltyCheckoutPreview,
  LoyaltyHistoryResponse,
  LoyaltyProfile,
} from './loyalty.types'

export const loyaltyAdapter = {
  getLoyaltyProfile: async (): Promise<LoyaltyProfile> => {
    const { data } = await api.get<BackendLoyaltyProfileDto>('/account/loyalty')

    return mapLoyaltyProfile(data)
  },

  getLoyaltyHistory: async (
    page: number,
    pageSize: number,
  ): Promise<LoyaltyHistoryResponse> => {
    return {
      items: [],
      page,
      pageSize,
      total: 0,
    }
  },

  getLoyaltyBenefits: async (): Promise<LoyaltyBenefit[]> => {
    return []
  },

  getLoyaltyAchievementsPreview: achievementsAdapter.getAchievementsPreview,

  getCheckoutLoyaltyPreview: async (
    orderTotal: number,
  ): Promise<LoyaltyCheckoutPreview> => {
    return {
      orderTotal,
      availablePoints: 0,
      maxRedeemablePoints: 0,
      discountValue: 0,
      finalTotal: orderTotal,
      isRedemptionAvailable: false,
      helperText:
        'Попередній розрахунок знижки ще не доступний. Остаточна сума буде розрахована під час оплати.',
    }
  },
}
