import { api } from '../lib/axios'
import type { OrderStatus, TicketStatus } from '@/features/account/model/order.types'

export interface AdminTicketDto {
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

export interface AdminOrderDto {
  id: string
  createdAt: string
  totalAmount: number
  status: OrderStatus | string
  tickets: AdminTicketDto[]
}

export const adminOrdersService = {
  getUserOrders: async (userId: string): Promise<AdminOrderDto[]> => {
    const { data } = await api.get<AdminOrderDto[]>(`/orders/user/${userId}`)
    return data
  },

  cancelOrder: async (id: string): Promise<void> => {
    await api.post(`/orders/${id}/cancel`)
  },
}
