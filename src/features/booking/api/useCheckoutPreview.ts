import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  checkoutPreviewApi,
  type CheckoutPreviewRequest,
} from '@/features/booking/api/booking.service'

interface UseCheckoutPreviewParams extends CheckoutPreviewRequest {
  enabled?: boolean
}

const useDebouncedPreviewParams = (
  params: UseCheckoutPreviewParams,
): UseCheckoutPreviewParams => {
  const [debouncedParams, setDebouncedParams] = useState(params)
  const {
    sessionId,
    seatIds,
    useLoyaltyPoints,
    applyGoldUpgrade,
    enabled = true,
  } = params

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedParams({
        sessionId,
        seatIds,
        useLoyaltyPoints,
        applyGoldUpgrade,
        enabled,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [applyGoldUpgrade, enabled, seatIds, sessionId, useLoyaltyPoints])

  return debouncedParams
}

export const useCheckoutPreview = (params: UseCheckoutPreviewParams) => {
  const debouncedParams = useDebouncedPreviewParams(params)
  const {
    sessionId,
    seatIds,
    useLoyaltyPoints,
    applyGoldUpgrade,
    enabled = true,
  } = debouncedParams

  const query = useQuery({
    queryKey: [
      'booking-checkout-preview',
      sessionId,
      seatIds,
      useLoyaltyPoints,
      applyGoldUpgrade,
    ],
    queryFn: () =>
      checkoutPreviewApi({
        sessionId,
        seatIds,
        useLoyaltyPoints,
        applyGoldUpgrade,
      }),
    enabled: enabled && Boolean(sessionId) && seatIds.length > 0,
  })

  return {
    preview: query.data,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
