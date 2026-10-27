import { api } from '@/shared/api/axios'
import { localDateKey, utcDaysForLocalDate } from '../lib/sessionDates'
import {
  type Session,
  type SessionAvailability,
  SessionStatus,
} from '../model/session.types'

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

const mapSession = (session: SessionDto): Session => ({
  id: session.id,
  movieId: session.movieId,
  hallId: session.hallId,
  startTime: session.startTime,
  endTime: session.endTime || session.startTime,
  status: session.status || SessionStatus.Scheduled,
  priceBase: session.price,
  hallName: session.hallName || 'Зал',
  movieTitle: session.movieTitle || 'Фільм',
  pricingId: session.pricingId,
})

export const sessionsService = {
  getForLocalDate: async (
    date: Date,
    signal?: AbortSignal,
  ): Promise<Session[]> => {
    const days = await Promise.all(
      utcDaysForLocalDate(date).map(async day => {
        const { data } = await api.get<SessionDto[]>('/sessions/by-date', {
          params: { date: day },
          signal,
        })
        return data.map(mapSession)
      }),
    )
    return days
      .flat()
      .filter(
        session =>
          localDateKey(new Date(session.startTime)) === localDateKey(date),
      )
  },
  getSeatAvailability: async (
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<SessionAvailability> => {
    const { data } = await api.get<SessionAvailability>(
      `/sessions/${sessionId}/seats`,
      { signal, headers: { 'Cache-Control': 'no-cache' } },
    )
    return data
  },

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

      return sessions.map(mapSession)
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
