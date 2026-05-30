import { api } from '@/lib/axios'
import type { Hall, Session } from '@/features/halls/model/hall.types'

export interface CreateOrderResponse {
	orderId: string
	status: string
}

interface SessionsResponse {
	items?: SessionDto[]
}

interface SessionDto {
	id: string
	movieId: string
	hallId: string
	startTime: string
	endTime?: string
	status?: string
	price?: number
	hallName?: string
	movieTitle?: string
	pricingId?: string
}

export interface CreateOrderPayload {
	sessionId: string
	seatIds: string[]
	useLoyaltyPoints: boolean
	applyGoldUpgrade: boolean
	paymentToken?: string
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
			const { data } = await api.get<SessionsResponse | SessionDto[]>(
				'/sessions',
				{
					params: { pageNumber: 1, pageSize: 1000 },
				},
			)
			const sessions = Array.isArray(data) ? data : data.items || []

			return sessions.map(session => ({
				id: session.id,
				movieId: session.movieId,
				hallId: session.hallId,
				startTime: session.startTime,
				endTime: session.endTime || session.startTime,
				status: session.status || 'Scheduled',
				priceBase: session.price,
				hallName: session.hallName || 'Зал',
				movieTitle: session.movieTitle || 'Фільм',
				seats: [],
				pricingId: session.pricingId,
			}))
		} catch (error) {
			console.error('Error fetching all sessions:', error)
			throw error
		}
	},

	lockSeat: async (sessionId: string, seatId: string): Promise<void> => {
		await api.post('/seats/lock', { sessionId, seatId })
	},

	createOrder: async ({
		sessionId,
		seatIds,
		useLoyaltyPoints,
		applyGoldUpgrade,
		paymentToken = 'dummy_token',
	}: CreateOrderPayload): Promise<CreateOrderResponse> => {
		const { data } = await api.post<CreateOrderResponse>('/orders', {
			sessionId,
			seatIds,
			useLoyaltyPoints,
			applyGoldUpgrade,
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
