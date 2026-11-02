import { useInfiniteQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/model/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'
import {
  getHistoryTransactions,
  loyaltyHistoryQueryOptions,
} from './loyaltyHistoryQuery'

const DEFAULT_TRANSACTION_LIMIT = 20

export const useLoyaltyHistory = (limit = DEFAULT_TRANSACTION_LIMIT) => {
  const { user } = useAuth()
  const query = useInfiniteQuery(
    loyaltyHistoryQueryOptions(
      user?.id,
      limit,
      loyaltyService.getLoyaltyTransactionHistory,
    ),
  )

  const transactions = getHistoryTransactions(query.data?.pages ?? [])
  const totalCount = query.data?.pages.at(-1)?.totalCount ?? 0

  return {
    ...query,
    transactions,
    totalCount,
    hasMore: query.hasNextPage,
    loadMore: () => {
      if (!query.isFetching && query.hasNextPage)
        return query.fetchNextPage({ cancelRefetch: false })
    },
    retry: () =>
      query.isFetchNextPageError
        ? query.fetchNextPage({ cancelRefetch: false })
        : query.refetch({ cancelRefetch: false }),
    isLoadingMore: query.isFetchingNextPage,
  }
}
