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

export interface SessionSeatAvailability {
  id: string
  row: number
  number: number
  rowLabel: string
  gridX: number
  gridY: number
  type: string
  price: number
  isAvailable: boolean
  isSold: boolean
  isLocked: boolean
  isLockedByCurrentUser: boolean
}

export interface SessionAvailability {
  sessionId: string
  hallId: string
  movieTitle: string
  startTime: string
  seats: SessionSeatAvailability[]
}
