export const OrderStatus = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const TicketStatus = {
  Valid: 'Valid',
  Used: 'Used',
  Refunded: 'Refunded',
} as const

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus]

export interface TicketDto {
  id: string
  movieTitle: string
  posterUrl: string
  hallName: string
  rowLabel: string
  seatNumber: number
  seatType: string
  price: number
  sessionStart: string
  status: TicketStatus | string
  secretCode: string
}

export interface OrderDto {
  id: string
  createdAt: string
  totalAmount: number
  status: OrderStatus | string
  tickets: TicketDto[]
}

export interface MyOrdersVm {
  activeOrders: OrderDto[]
  pastOrders: OrderDto[]
}

export interface OrderItem {
  id: string
  bookingId: string
  totalPrice: number
  status: 'active' | 'completed' | 'cancelled'
  sessionDate: string
  movieTitle: string
  posterUrl: string
  cinemaHall: string
  seats: string[]
}
