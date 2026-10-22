import { seatCoordinateKey } from '@/entities/hall/lib/seatGeometry'
import type { HallSeatDefinition } from '@/entities/hall/model/hall.types'
import { HALL_EDITOR_LIMITS } from '../config/hallEditor.config'

export type HallPaintTool = 'paint' | 'erase'

export const paintHallSeat = (
  seats: Map<string, HallSeatDefinition>,
  gridX: number,
  gridY: number,
  seatTypeId: string | undefined,
  tool: HallPaintTool,
) => {
  const key = seatCoordinateKey({ gridX, gridY })
  const previous = seats.get(key)
  if (tool === 'paint' && !previous && seats.size >= HALL_EDITOR_LIMITS.seats)
    return seats
  if (
    tool === 'erase'
      ? !previous
      : !seatTypeId || previous?.seatTypeId === seatTypeId
  ) {
    return seats
  }
  const next = new Map(seats)
  if (tool === 'erase') next.delete(key)
  else if (seatTypeId) next.set(key, { gridX, gridY, seatTypeId })
  return next
}

export const seatsOutsideBounds = (
  seats: Iterable<HallSeatDefinition>,
  rows: number,
  cols: number,
) => Array.from(seats).filter(seat => seat.gridX > cols || seat.gridY > rows)
