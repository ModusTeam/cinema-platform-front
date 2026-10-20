import { api } from '@/shared/api/axios'
import { type Session, SessionStatus } from '../model/session.types'

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

export const sessionsService = {
  getByMovieId: async (movieId: string): Promise<Session[]> => {
    const allSessions = await sessionsService.getAll()
    return allSessions.filter(session => session.movieId === movieId)
  },

  getAll: async (): Promise<Session[]> => {
    try {
      const { data } = await api.get<SessionsResponse | SessionDto[]>(
        '/sessions',
        { params: { pageNumber: 1, pageSize: 1000 } },
      )
      const sessions = Array.isArray(data) ? data : data.items || []

      return sessions.map(session => ({
        id: session.id,
        movieId: session.movieId,
        hallId: session.hallId,
        startTime: session.startTime,
        endTime: session.endTime || session.startTime,
        status: session.status || SessionStatus.Scheduled,
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

  getDetails: async (sessionId: string): Promise<Session> => {
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
