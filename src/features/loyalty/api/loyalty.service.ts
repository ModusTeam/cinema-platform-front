import { loyaltyAdapter } from './loyalty.adapter'
import type {
  LoyaltyBenefit,
  LoyaltyCheckoutPreview,
  LoyaltyHistoryResponse,
  LoyaltyProfile,
} from './loyalty.types'
import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'

export const loyaltyService = {
  getLoyaltyProfile: async (): Promise<LoyaltyProfile> => {
    return loyaltyAdapter.getLoyaltyProfile()
  },
  getLoyaltyHistory: async (
    page: number,
    pageSize: number,
  ): Promise<LoyaltyHistoryResponse> => {
    return loyaltyAdapter.getLoyaltyHistory(page, pageSize)
  },
  getLoyaltyBenefits: async (): Promise<LoyaltyBenefit[]> => {
    return loyaltyAdapter.getLoyaltyBenefits()
  },
  getLoyaltyAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
    return loyaltyAdapter.getLoyaltyAchievementsPreview()
  },
  getCheckoutLoyaltyPreview: async (
    orderTotal: number,
  ): Promise<LoyaltyCheckoutPreview> => {
    return loyaltyAdapter.getCheckoutLoyaltyPreview(orderTotal)
  },
}
