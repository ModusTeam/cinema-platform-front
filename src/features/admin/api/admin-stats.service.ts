import { api } from '../lib/axios'

export interface DailySalesDto {
  date: string
  revenue: number
  ticketsCount: number
}

export interface TopMovieDto {
  movieTitle: string
  ticketsSold: number
  revenue: number
}

export const OccupancyLevel = {
  Critical: 0,
  Low: 1,
  Moderate: 2,
  High: 3,
  Full: 4,
} as const

export type OccupancyLevel =
  (typeof OccupancyLevel)[keyof typeof OccupancyLevel]

export interface DashboardStatsDto {
  totalRevenue: number
  revenueChangePercent: number
  ticketsSold: number
  ticketsChangePercent: number
  activeMoviesCount: number
  occupancyRate: number
  occupancyChangePercent: number
  occupancyLevel: OccupancyLevel
  salesChart: DailySalesDto[]
  topMovies: TopMovieDto[]
}

export const adminStatsService = {
  getDashboardStats: async (
    from?: Date,
    to?: Date,
  ): Promise<DashboardStatsDto> => {
    const params: any = {}
    if (from) params.from = from.toISOString()
    if (to) params.to = to.toISOString()

    const { data } = await api.get<DashboardStatsDto>('/stats/dashboard', {
      params,
    })
    return data
  },
}
