import { OrderStatus } from '@/entities/order/model/order.types'
import { bookingCopy } from '../config/booking.copy'

export const getBookingOrderResult = (status?: string) => {
  const copy = bookingCopy.result
  switch (status) {
    case OrderStatus.Paid:
      return { title: copy.paid, description: copy.paidDescription }
    case OrderStatus.Pending:
      return { title: copy.pending, description: copy.pendingDescription }
    case OrderStatus.PaymentProcessing:
      return { title: copy.processing, description: copy.pendingDescription }
    case OrderStatus.PaymentOutcomeUnknown:
      return { title: copy.unknown, description: copy.unknownDescription }
    case OrderStatus.Failed:
      return { title: copy.failed, description: copy.failedDescription }
    case OrderStatus.Cancelled:
      return { title: copy.cancelled, description: copy.failedDescription }
    case OrderStatus.Expired:
      return { title: copy.expired, description: copy.failedDescription }
    default:
      return {
        title: bookingCopy.success.title,
        description: bookingCopy.success.description,
      }
  }
}
