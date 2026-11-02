import { infiniteQueryOptions } from '@tanstack/react-query'
import type { LoyaltyTransactionHistory } from './loyalty.types'

export function loyaltyHistoryQueryOptions(
  userId: string | undefined,
  limit: number,
  fetchPage: (
    limit: number,
    skip: number,
  ) => Promise<LoyaltyTransactionHistory>,
) {
  return infiniteQueryOptions({
    queryKey: ['loyalty-transactions', userId, limit],
    queryFn: ({ pageParam }) => fetchPage(limit, pageParam),
    initialPageParam: 0,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.skip + lastPage.transactions.length
      return lastPage.transactions.length > 0 && nextSkip < lastPage.totalCount
        ? nextSkip
        : undefined
    },
  })
}

export function getHistoryTransactions(pages: LoyaltyTransactionHistory[]) {
  const seen = new Set<string>()
  return pages.flatMap(page =>
    page.transactions.filter(transaction => {
      if (seen.has(transaction.id)) return false
      seen.add(transaction.id)
      return true
    }),
  )
}
