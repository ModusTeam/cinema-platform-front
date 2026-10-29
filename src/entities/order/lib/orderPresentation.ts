import { type OrderItem, OrderStatus, TicketStatus } from '../model/order.types'

export const orderStatusLabels: Record<string, string> = {
  [OrderStatus.Pending]: 'Очікує оплати',
  [OrderStatus.Paid]: 'Оплачено',
  [OrderStatus.PaymentProcessing]: 'Оплата обробляється',
  [OrderStatus.PaymentOutcomeUnknown]: 'Статус оплати уточнюється',
  [OrderStatus.Failed]: 'Оплата не вдалася',
  [OrderStatus.Cancelled]: 'Скасовано',
  [OrderStatus.Expired]: 'Термін минув',
}

export const ticketStatusLabels: Record<string, string> = {
  [TicketStatus.Valid]: 'Дійсний',
  [TicketStatus.Reserved]: 'Зарезервовано',
  [TicketStatus.Used]: 'Використано',
  [TicketStatus.Refunded]: 'Повернено',
  [TicketStatus.Released]: 'Звільнено',
}

// Keep the API's parallel seat/status/ID association; never filter then reindex.
export const getOrderTickets = (order: OrderItem) =>
  order.ticketIds.map((id, index) => ({
    id,
    seat: order.seats[index],
    status: order.ticketStatuses[index],
    canShowQr:
      Boolean(id) &&
      order.status === OrderStatus.Paid &&
      order.ticketStatuses[index] === TicketStatus.Valid,
  }))

export const isHistoryOrder = (order: OrderItem) =>
  order.isPastSession ||
  order.status === OrderStatus.Cancelled ||
  order.status === OrderStatus.Failed ||
  order.status === OrderStatus.Expired
