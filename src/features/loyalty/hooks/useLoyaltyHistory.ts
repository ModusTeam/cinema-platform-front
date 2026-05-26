import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'

export const useLoyaltyHistory = () => {
  const items: LoyaltyHistoryItem[] = []

  return {
    items,
    hasMore: false,
    isLoading: false,
    isFetching: false,
    error: null,
    page: 1,
    setPage: () => undefined,
    isUnavailable: true,
  }
}
