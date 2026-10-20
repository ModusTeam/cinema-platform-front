import type { Seat } from '@/entities/hall/model/hall.types'

export const formatBookingSessionDateTime = (startTime: string): string =>
  `${new Date(startTime).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
  })}, ${new Date(startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const formatBookingSeat = (seat: Seat): string =>
  `Ряд ${seat.row}, Місце ${seat.number}`

export const formatCheckoutAmount = (
  amount: number | undefined,
  currency: string,
): string => (amount === undefined ? '—' : `${amount} ${currency}`)
