import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'
import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'

const PAGE_SIZE = 6

export const useLoyaltyHistory = () => {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<LoyaltyHistoryItem[]>([])

  const query = useQuery({
    queryKey: ['loyalty-history', user?.id, page],
    queryFn: () => loyaltyService.getLoyaltyHistory(page, PAGE_SIZE),
    enabled: !!user,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (!user) return
    setPage(1)
    setItems([])
  }, [user?.id])

  useEffect(() => {
    if (!query.data) return

    setItems(prev =>
      query.data?.page === 1
        ? query.data.items
        : [...prev, ...query.data.items],
    )
  }, [query.data])

  const total = query.data?.total ?? 0
  const hasMore = items.length < total

  return {
    items,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    total,
    hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}
