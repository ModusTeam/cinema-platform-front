import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  type CheckoutPreviewRequest,
  checkoutPreviewApi,
} from '@/features/booking/api/booking.service'
import {
  matchesCheckoutPreview,
  sameCheckoutRequest,
} from '../lib/checkoutPreview'

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
  const { user } = useAuth()
  const debouncedParams = useDebouncedPreviewParams(params)
  const isCurrent =
    sameCheckoutRequest(params, debouncedParams) &&
    (params.enabled !== false) === (debouncedParams.enabled !== false)
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
      user?.id,
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
    enabled:
      !!user &&
      params.enabled !== false &&
      enabled &&
      isCurrent &&
      Boolean(sessionId) &&
      seatIds.length > 0,
    staleTime: 0,
  })

  const active = params.enabled !== false
  const available = active && isCurrent && !query.isFetching && !query.isError
  const valid = matchesCheckoutPreview(query.data, params)
  return {
    preview: available && valid ? query.data : undefined,
    isLoading: active && (!isCurrent || query.isLoading || query.isFetching),
    isError:
      active && isCurrent && (query.isError || (query.isSuccess && !valid)),
    error: query.error,
    refetch: query.refetch,
  }
}
