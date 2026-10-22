import { type Seat, SeatStatus } from '../model/hall.types'

export const isSeatAvailable = (
  seat: Pick<Seat, 'id' | 'status'>,
  occupiedIds: ReadonlySet<string>,
) =>
  seat.status === SeatStatus.Active && !occupiedIds.has(seat.id.toLowerCase())
