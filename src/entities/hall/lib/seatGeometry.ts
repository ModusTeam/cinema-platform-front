import type { HallLayout, HallSeatDefinition } from '../model/hall.types'

export interface GridCoordinate {
  gridX: number
  gridY: number
}

export const seatCoordinateKey = ({ gridX, gridY }: GridCoordinate) =>
  `${gridX}:${gridY}`

export const getSeatBounds = (seats: readonly GridCoordinate[]) =>
  seats.reduce(
    (bounds, seat) => ({
      rows: Math.max(bounds.rows, seat.gridY),
      cols: Math.max(bounds.cols, seat.gridX),
    }),
    { rows: 0, cols: 0 },
  )

export const createSeatLookup = <T extends GridCoordinate>(
  seats: readonly T[],
) => new Map(seats.map(seat => [seatCoordinateKey(seat), seat]))

// Start at 1 so leading empty rows and columns retain their absolute positions.
export const getGridCells = (rows: number, cols: number): GridCoordinate[] =>
  Array.from({ length: rows * cols }, (_, index) => ({
    gridX: (index % cols) + 1,
    gridY: Math.floor(index / cols) + 1,
  }))

export const serializeSeats = (
  seats: Iterable<HallSeatDefinition>,
): HallSeatDefinition[] =>
  Array.from(seats, ({ gridX, gridY, seatTypeId }) => ({
    gridX,
    gridY,
    seatTypeId,
  })).sort((a, b) => a.gridY - b.gridY || a.gridX - b.gridX)

export const createRectangularSeats = (
  rows: number,
  cols: number,
  seatTypeId: string,
): HallSeatDefinition[] =>
  getGridCells(rows, cols).map(cell => ({ ...cell, seatTypeId }))

export const layoutsEqual = (a: HallLayout, b: HallLayout): boolean => {
  if (a.rows !== b.rows || a.seatsPerRow !== b.seatsPerRow) return false
  const left = serializeSeats(a.seats)
  const right = serializeSeats(b.seats)
  return (
    left.length === right.length &&
    left.every((seat, index) => {
      const other = right[index]
      return (
        seat.gridX === other.gridX &&
        seat.gridY === other.gridY &&
        seat.seatTypeId.toLowerCase() === other.seatTypeId.toLowerCase()
      )
    })
  )
}
