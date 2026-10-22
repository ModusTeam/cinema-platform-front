import { type Seat, SeatStatus } from '@/entities/hall/model/hall.types'
import type { SessionSeatAvailability } from '@/entities/session/model/session.types'

export type BookingSeatState =
  | 'available'
  | 'selected'
  | 'locked'
  | 'sold'
  | 'maintenance'
  | 'pending'
  | 'unknown'

export const ownsSeatLock = (seat?: SessionSeatAvailability) =>
  !!seat && !seat.isSold && seat.isLocked && seat.isLockedByCurrentUser

export const classifySeat = (
  seat: Pick<Seat, 'status'>,
  occupancy: SessionSeatAvailability | undefined,
  selected: boolean,
  pending: boolean,
): BookingSeatState => {
  if (seat.status === SeatStatus.Maintenance) return 'maintenance'
  if (seat.status !== SeatStatus.Active || occupancy?.isSold) return 'sold'
  if (pending) return 'pending'
  if (!occupancy) return 'unknown'
  if (occupancy.isLocked && !occupancy.isLockedByCurrentUser) return 'locked'
  if (selected && ownsSeatLock(occupancy)) return 'selected'
  if (occupancy.isAvailable || ownsSeatLock(occupancy)) return 'available'
  return 'unknown'
}
