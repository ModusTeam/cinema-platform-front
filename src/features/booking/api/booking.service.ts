import { api } from '@/shared/api/axios'

export interface CreateOrderResponse {
  orderId: string
  status: string
}

export interface CreateOrderPayload {
  sessionId: string
  seatIds: string[]
  useLoyaltyPoints: boolean
  applyGoldUpgrade: boolean
  paymentToken?: string
}

export interface CheckoutPreviewRequest {
  sessionId: string
  seatIds: string[]
  useLoyaltyPoints: boolean
  applyGoldUpgrade: boolean
}

export interface CheckoutPreviewResponse {
  currency: string
  canCheckout: boolean
  originalAmount: number
  amountAfterGoldUpgrade: number
  finalAmountToPay: number
  totalDiscountAmount: number
  goldUpgrade: {
    requested: boolean
    canApply: boolean
    applied: boolean
    discountAmount: number
    seatId: string | null
    priceBefore: number | null
    priceAfter: number | null
    reasonCode: string | null
    reason: string | null
  }
  loyaltyPoints: {
    requested: boolean
    canApply: boolean
    applied: boolean
    pointsToDeduct: number
    discountAmount: number
    amountToPay: number
    reasonCode: string | null
    reason: string | null
  }
  tickets: Array<{
    seatId: string
    seatType: string
    originalPrice: number
    finalPriceAfterGoldUpgrade: number
    goldDiscountAmount: number
    isGoldUpgraded: boolean
  }>
  warnings: string[]
}

export const checkoutPreviewApi = async (
  payload: CheckoutPreviewRequest,
): Promise<CheckoutPreviewResponse> => {
  const { data } = await api.post<CheckoutPreviewResponse>(
    '/orders/checkout-preview',
    payload,
  )
  return data
}

export const bookingService = {
  lockSeat: async (sessionId: string, seatId: string): Promise<void> => {
    await api.post('/seats/lock', { sessionId, seatId })
  },

  createOrder: async ({
    sessionId,
    seatIds,
    useLoyaltyPoints,
    applyGoldUpgrade,
    paymentToken = 'dummy_token',
  }: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const { data } = await api.post<CreateOrderResponse>('/orders', {
      sessionId,
      seatIds,
      useLoyaltyPoints,
      applyGoldUpgrade,
      paymentToken,
    })
    return data
  },

}
