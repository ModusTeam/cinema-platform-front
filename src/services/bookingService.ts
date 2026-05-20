import { api } from '@/lib/axios'
import type { Hall, Session } from '@/types/hall'

export interface CreateOrderResponse {
	orderId: string
	status: string
}

export const bookingService = {
	getSessionsByMovieId: async (movieId: string): Promise<Session[]> => {
		const allSessions = await bookingService.getAllSessions()
		return allSessions.filter(s => s.movieId === movieId)
	},

	getHallById: async (hallId: string): Promise<Hall> => {
		const { data } = await api.get(`/halls/${hallId}`)
		return {
			id: data.id,
			name: data.name,
			capacity: data.capacity || (data.seats ? data.seats.length : 0),
			rowsCount: data.rows,
			colsCount: data.seatsPerRow,
			seats: data.seats || [],
			technologies: data.technologies || [],
		}
	},

	getAllSessions: async (): Promise<Session[]> => {
		try {
			const { data } = await api.get<any>('/sessions', {
				params: { pageNumber: 1, pageSize: 1000 },
			})
			const sessions = data.items || data

			return sessions.map((s: any) => ({
				id: s.id,
				movieId: s.movieId,
				hallId: s.hallId,
				startTime: s.startTime,
				priceBase: s.price,
				hallName: s.hallName || 'Зал',
				movieTitle: s.movieTitle || 'Фільм',
				seats: [],
				pricingId: s.pricingId,
			}))
		} catch (error) {
			console.error('Error fetching all sessions:', error)
			throw error
		}
	},

	lockSeat: async (sessionId: string, seatId: string): Promise<void> => {
		await api.post('/seats/lock', { sessionId, seatId })
	},

	createOrder: async (
		sessionId: string,
		seatIds: string[],
		paymentToken: string = 'dummy_token',
	): Promise<CreateOrderResponse> => {
		const { data } = await api.post<CreateOrderResponse>('/orders', {
			sessionId,
			seatIds,
			paymentToken,
		})
		return data
	},

	getSessionDetails: async (sessionId: string): Promise<Session> => {
		const { data } = await api.get<Session>(`/sessions/${sessionId}`)

		return {
			id: data.id,
			startTime: data.startTime,
			endTime: data.endTime,
			status: data.status,
			movieId: data.movieId,
			movieTitle: data.movieTitle,
			hallId: data.hallId,
			hallName: data.hallName,
			priceBase: data.priceBase,
			pricingId: data.pricingId,
			occupiedSeatIds: data.occupiedSeatIds || [],
		} as Session
	},
}
