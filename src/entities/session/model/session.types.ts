export const SessionStatus = {
  Scheduled: 'Scheduled',
  Cancelled: 'Cancelled',
} as const

export interface Session {
  id: string
  startTime: string
  endTime: string
  status: string
  movieId: string
  movieTitle: string
  hallId: string
  hallName: string
  priceBase?: number
  pricingId?: string
  occupiedSeatIds?: string[]
}
