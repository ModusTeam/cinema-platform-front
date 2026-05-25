import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'
import { useQuery } from '@tanstack/react-query'

const PAGE_SIZE = 10

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
		if (!query.data) return

		setItems(prev => {
			if (page === 1) return query.data.items

			const nextItems = [...prev, ...query.data.items]
			return nextItems.filter(
				(item, index, array) =>
					array.findIndex(candidate => candidate.id === item.id) === index,
			)
		})
	}, [page, query.data])

	useEffect(() => {
		setPage(1)
		setItems([])
	}, [user?.id])

	const hasMore = items.length < (query.data?.total ?? items.length)

	return {
		items,
		hasMore,
		isLoading: query.isLoading && page === 1,
		isFetching: query.isFetching,
		error: query.error,
		page,
		setPage,
	}
}
