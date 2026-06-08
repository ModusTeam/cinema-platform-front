import { useInfiniteQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'

const DEFAULT_TRANSACTION_LIMIT = 20

export const useLoyaltyHistory = (limit = DEFAULT_TRANSACTION_LIMIT) => {
  const { user } = useAuth()
  const query = useInfiniteQuery({
    queryKey: ['loyalty-transactions', user?.id, limit],
    queryFn: ({ pageParam }) =>
      loyaltyService.getLoyaltyTransactionHistory(limit, pageParam),
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.skip + lastPage.transactions.length

      return nextSkip < lastPage.totalCount ? nextSkip : undefined
    },
  })

  const transactions =
    query.data?.pages.flatMap(page => page.transactions) ?? []
  const totalCount = query.data?.pages.at(-1)?.totalCount ?? 0

  return {
    ...query,
    transactions,
    totalCount,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  }
}
