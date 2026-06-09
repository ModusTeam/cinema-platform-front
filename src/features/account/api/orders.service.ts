import { api } from '@/lib/axios'
import {
  type OrderItem,
  type MyOrdersVm,
  type OrderDto,
  OrderStatus,
} from '@/features/account/model/order.types'

const mapOrderDtoToItem = (dto: OrderDto): OrderItem | null => {
  if (!dto.tickets || dto.tickets.length === 0) return null

  const firstTicket = dto.tickets[0]
  const sessionDate = new Date(firstTicket.sessionStart)
  const now = new Date()

  let uiStatus: 'active' | 'completed' | 'cancelled' = 'active'

  const statusStr = String(dto.status)

  if (statusStr === OrderStatus.Cancelled || statusStr === OrderStatus.Failed) {
    uiStatus = 'cancelled'
  } else if (statusStr === OrderStatus.Pending) {
    uiStatus = 'cancelled'
  } else {
    if (sessionDate < now) {
      uiStatus = 'completed'
    } else {
      uiStatus = 'active'
    }
  }

  return {
    id: dto.id,
    bookingId: `ORD-${dto.id.substring(0, 8).toUpperCase()}`,
    totalPrice: dto.amountPaid ?? dto.totalAmount,
    status: uiStatus,
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
