export interface SeatType {
  id: string
  name: string
  description?: string
}

export const SeatStatus = {
  Active: 'Active',
  Maintenance: 'Maintenance',
  Reserved: 'Reserved',
} as const

export interface HallSeatDefinition {
  gridX: number
  gridY: number
  seatTypeId: string
}

export interface HallLayout {
  rows: number
  seatsPerRow: number
  seats: HallSeatDefinition[]
}

export interface Seat extends HallSeatDefinition {
  id: string
  row: string
  number: number
  status: string
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
