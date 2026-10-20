export interface SeatType {
  id: string
  name: string
  description?: string
}

export const SeatStatus = {
  Sold: 'Sold',
  Locked: 'Locked',
} as const

export interface Seat {
  id: string
  row: string
  number: number
  gridX: number
  gridY: number
  status: string
  seatTypeId: string
  seatTypeName: string
}

export interface Hall {
  id: string
  name: string
  capacity: number
  seats: Seat[]
  technologies?: Technology[]
  rowsCount?: number
  colsCount?: number
}

export interface Technology {
  id: string
  name: string
  type: string
}
