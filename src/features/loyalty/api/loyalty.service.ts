import { loyaltyAdapter } from './loyalty.adapter'
import type {
  LoyaltyBenefit,
  LoyaltyCheckoutPreview,
  LoyaltyProfile,
  LoyaltyTransactionHistory,
} from './loyalty.types'
import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'

export const loyaltyService = {
  getLoyaltyProfile: async (): Promise<LoyaltyProfile> => {
    return loyaltyAdapter.getLoyaltyProfile()
  },
  getLoyaltyTransactionHistory: async (
    limit: number,
    skip: number,
  ): Promise<LoyaltyTransactionHistory> => {
    return loyaltyAdapter.getLoyaltyTransactionHistory(limit, skip)
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
