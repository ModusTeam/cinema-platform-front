import { useEffect, useMemo, useState } from 'react'
import type { Seat } from '@/entities/hall/model/hall.types'
import { useLoyalty } from '@/features/loyalty/model/useLoyalty'
import { useCheckoutPreview } from '../api/useCheckoutPreview'
import {
  bookingCopy,
  GOLD_UPGRADE_REJECTION_CODES,
  LOYALTY_POINTS_REJECTION_CODES,
} from '../config/booking.copy'

export const useCheckoutOptions = (
  sessionId: string,
  seats: Seat[],
  enabled: boolean,
) => {
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [applyGoldUpgrade, setApplyGoldUpgrade] = useState(false)
  const [goldRejection, setGoldRejection] = useState<{
    key: string
    reason: string
  } | null>(null)
  const [pointsRejection, setPointsRejection] = useState<{
    key: string
    reason: string
  } | null>(null)
  const loyalty = useLoyalty()
  const seatIds = useMemo(() => seats.map(seat => seat.id), [seats])
  const selectionKey = `${sessionId}:${seatIds.join('|')}`
  const goldBlockedReason =
    goldRejection?.key === selectionKey ? goldRejection.reason : null
  const pointsBlockedReason =
    pointsRejection?.key === selectionKey ? pointsRejection.reason : null
  const calculation = useCheckoutPreview({
    sessionId,
    seatIds,
    useLoyaltyPoints,
    applyGoldUpgrade,
    enabled,
  })
  const goldProbe = useCheckoutPreview({
    sessionId,
    seatIds,
    useLoyaltyPoints: false,
    applyGoldUpgrade: true,
    enabled: enabled && !applyGoldUpgrade,
  })
  const preview = calculation.preview
  const goldAvailability = goldProbe.preview?.goldUpgrade

  useEffect(() => {
    if (preview?.goldUpgrade.requested && !preview.goldUpgrade.canApply) {
      setApplyGoldUpgrade(false)
      if (
        preview.goldUpgrade.reasonCode &&
        GOLD_UPGRADE_REJECTION_CODES.has(preview.goldUpgrade.reasonCode)
      ) {
        setGoldRejection({
          key: selectionKey,
          reason:
            preview.goldUpgrade.reason || bookingCopy.checkout.goldUnavailable,
        })
      }
    }
    if (preview?.loyaltyPoints.requested && !preview.loyaltyPoints.canApply) {
      setUseLoyaltyPoints(false)
      if (
        preview.loyaltyPoints.reasonCode &&
        LOYALTY_POINTS_REJECTION_CODES.has(preview.loyaltyPoints.reasonCode)
      ) {
        setPointsRejection({
          key: selectionKey,
          reason:
            preview.loyaltyPoints.reason ||
            bookingCopy.checkout.loyaltyUnavailable,
        })
      }
    }
  }, [preview, selectionKey])

  useEffect(() => {
    if (goldAvailability?.canApply) setGoldRejection(null)
    else if (
      goldAvailability?.reasonCode &&
      GOLD_UPGRADE_REJECTION_CODES.has(goldAvailability.reasonCode)
    ) {
      setGoldRejection({
        key: selectionKey,
        reason: goldAvailability.reason || bookingCopy.checkout.goldUnavailable,
      })
    }
  }, [goldAvailability, selectionKey])

  return {
    ...calculation,
    useLoyaltyPoints,
    applyGoldUpgrade,
    setUseLoyaltyPoints,
    setApplyGoldUpgrade,
    goldAvailability,
    goldBlockedReason,
    pointsBlockedReason,
    goldLoading: goldProbe.isLoading,
    goldError: goldProbe.isError,
    retryGold: goldProbe.refetch,
    goldDisabled:
      !applyGoldUpgrade && (!goldAvailability?.canApply || !!goldBlockedReason),
    pointsDisabled:
      loyalty.isLoading ||
      loyalty.isError ||
      !loyalty.data?.points ||
      !!pointsBlockedReason,
    points: loyalty.data?.points,
    pointsStatus: loyalty.isLoading
      ? bookingCopy.checkout.loyaltyLoading
      : loyalty.isError
        ? bookingCopy.checkout.loyaltyError
        : !loyalty.data?.points
          ? bookingCopy.checkout.noPoints
          : null,
  }
}

export type CheckoutOptions = ReturnType<typeof useCheckoutOptions>
