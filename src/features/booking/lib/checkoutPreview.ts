import { normalizeId } from '@/shared/lib/normalizeId'
import type {
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
} from '../api/booking.service'

export const sameCheckoutRequest = (
  first: CheckoutPreviewRequest,
  second: CheckoutPreviewRequest,
) =>
  first.sessionId === second.sessionId &&
  first.useLoyaltyPoints === second.useLoyaltyPoints &&
  first.applyGoldUpgrade === second.applyGoldUpgrade &&
  first.seatIds.length === second.seatIds.length &&
  first.seatIds.every((id, index) => id === second.seatIds[index])

export const matchesCheckoutPreview = (
  preview: CheckoutPreviewResponse | undefined,
  request: CheckoutPreviewRequest,
): preview is CheckoutPreviewResponse => {
  if (!preview || !request.sessionId || !request.seatIds.length) return false
  const tickets = new Set(
    preview.tickets.map(ticket => normalizeId(ticket.seatId)),
  )
  return (
    Boolean(preview.currency) &&
    Number.isFinite(preview.finalAmountToPay) &&
    preview.finalAmountToPay >= 0 &&
    preview.goldUpgrade.requested === request.applyGoldUpgrade &&
    preview.loyaltyPoints.requested === request.useLoyaltyPoints &&
    tickets.size === request.seatIds.length &&
    request.seatIds.every(id => tickets.has(normalizeId(id)))
  )
}
