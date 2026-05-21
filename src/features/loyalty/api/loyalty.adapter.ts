import type {
  LoyaltyBenefit,
  LoyaltyCheckoutPreview,
  LoyaltyHistoryResponse,
  LoyaltyProfile,
} from './loyalty.types'
import {
  mockGetCheckoutLoyaltyPreview,
  mockGetLoyaltyAchievementsPreview,
  mockGetLoyaltyBenefits,
  mockGetLoyaltyHistory,
  mockGetLoyaltyProfile,
} from './loyalty.mock'
import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'

const USE_MOCK = true

export const loyaltyAdapter = {
  getLoyaltyProfile: async (): Promise<LoyaltyProfile> => {
    if (USE_MOCK) return mockGetLoyaltyProfile()
    // NOTE: backend integration point
    throw new Error('Loyalty backend is not connected yet')
  },
  getLoyaltyHistory: async (
    page: number,
    pageSize: number,
  ): Promise<LoyaltyHistoryResponse> => {
    if (USE_MOCK) return mockGetLoyaltyHistory(page, pageSize)
    // NOTE: backend integration point
    throw new Error('Loyalty backend is not connected yet')
  },
  getLoyaltyBenefits: async (): Promise<LoyaltyBenefit[]> => {
    if (USE_MOCK) return mockGetLoyaltyBenefits()
    // NOTE: backend integration point
    throw new Error('Loyalty backend is not connected yet')
  },
  getLoyaltyAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
    if (USE_MOCK) return mockGetLoyaltyAchievementsPreview()
    // NOTE: backend integration point
    throw new Error('Loyalty backend is not connected yet')
  },
  getCheckoutLoyaltyPreview: async (
    orderTotal: number,
  ): Promise<LoyaltyCheckoutPreview> => {
    if (USE_MOCK) return mockGetCheckoutLoyaltyPreview(orderTotal)
    // NOTE: backend integration point
    throw new Error('Loyalty backend is not connected yet')
  },
}
