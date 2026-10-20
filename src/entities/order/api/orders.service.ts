import { api } from '@/shared/api/axios'
import type {
  OrderItem,
  MyOrdersVm,
  OrderDto,
} from '@/entities/order/model/order.types'

const mapOrderDtoToItem = (dto: OrderDto): OrderItem | null => {
  if (!dto.tickets || dto.tickets.length === 0) return null

  const firstTicket = dto.tickets[0]
  const sessionDate = new Date(firstTicket.sessionStart)
  const now = new Date()

  return {
    id: dto.id,
    bookingId: `ORD-${dto.id.substring(0, 8).toUpperCase()}`,
    totalPrice: dto.amountPaid ?? dto.totalAmount,
    status: dto.status,
    ticketStatuses: dto.tickets.map(ticket => ticket.status),
    ticketIds: dto.tickets.map(ticket => ticket.id),
    isPastSession: sessionDate < now,
    sessionDate: firstTicket.sessionStart,
    movieTitle: firstTicket.movieTitle,
    posterUrl:
      firstTicket.posterUrl || 'https://placehold.co/500x750?text=No+Image',
    cinemaHall: firstTicket.hallName,
    seats: dto.tickets.map(t => `${t.rowLabel}-${t.seatNumber}`),
  }
}

export const ordersService = {
  getMyOrders: async (): Promise<OrderItem[]> => {
    const { data } = await api.get<MyOrdersVm>('/orders')

    const allOrders = [...data.activeOrders, ...data.pastOrders]

    return allOrders
      .map(mapOrderDtoToItem)
      .filter((item): item is OrderItem => item !== null)
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await api.post(`/orders/${orderId}/cancel`)
  },
}
