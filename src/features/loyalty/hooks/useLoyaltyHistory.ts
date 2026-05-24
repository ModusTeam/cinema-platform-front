import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'
import { ordersService } from '@/services/ordersService'

const PAGE_SIZE = 10

export const useLoyaltyHistory = () => {
	const { user } = useAuth()
	const [page, setPage] = useState(1)

	const query = useQuery({
		queryKey: ['my-orders-loyalty', user?.id],
		queryFn: () => ordersService.getMyOrders(),
		enabled: !!user,
		staleTime: 60 * 1000,
	})

	const allItems = useMemo<LoyaltyHistoryItem[]>(() => {
		if (!query.data) return []

		const sortedOrders = [...query.data].sort(
			(a, b) =>
				new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
		)

		return sortedOrders.map(order => {
			const ticketsCount = order.seats?.length || 0
			const earnedPoints = Math.floor(order.totalPrice * 0.1)

			return {
				id: order.id,
				date: order.sessionDate,
				type: 'earn',
				points: earnedPoints,
				description: `Оплата замовлення ${order.bookingId} (${ticketsCount} квитків)`,
				orderId: order.id,
			}
		})
	}, [query.data])

	const paginatedItems = useMemo(() => {
		return allItems.slice(0, page * PAGE_SIZE)
	}, [allItems, page])

	const hasMore = paginatedItems.length < allItems.length

	return {
		items: paginatedItems,
		hasMore,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		page,
		setPage,
	}
}
