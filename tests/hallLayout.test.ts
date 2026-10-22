import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isSeatAvailable } from '../src/entities/hall/lib/seatAvailability'
import {
  createRectangularSeats,
  createSeatLookup,
  getGridCells,
  getSeatBounds,
  layoutsEqual,
  seatCoordinateKey,
  serializeSeats,
} from '../src/entities/hall/lib/seatGeometry'
import {
  paintHallSeat,
  seatsOutsideBounds,
} from '../src/features/admin/lib/hallPainting'

const sparse = [
  { gridX: 2, gridY: 2, seatTypeId: 'standard' },
  { gridX: 4, gridY: 2, seatTypeId: 'vip' },
  { gridX: 12, gridY: 13, seatTypeId: 'love' },
]

test('rectangle creation uses absolute 1-based coordinates including first and last cells', () => {
  const seats = createRectangularSeats(4, 8, 'standard')
  assert.equal(seats.length, 32)
  assert.deepEqual(seats[0], { gridX: 1, gridY: 1, seatTypeId: 'standard' })
  assert.deepEqual(seats.at(-1), { gridX: 8, gridY: 4, seatTypeId: 'standard' })
})

test('sparse lookup preserves leading/internal gaps, absolute coordinates and bounds beyond 10x10', () => {
  const lookup = createSeatLookup(sparse)
  assert.deepEqual(getSeatBounds(sparse), { rows: 13, cols: 12 })
  const cells = getGridCells(13, 12)
  assert.deepEqual(cells[0], { gridX: 1, gridY: 1 })
  assert.deepEqual(cells.at(-1), { gridX: 12, gridY: 13 })
  assert.equal(lookup.get(seatCoordinateKey({ gridX: 1, gridY: 1 })), undefined)
  assert.equal(lookup.get(seatCoordinateKey({ gridX: 3, gridY: 2 })), undefined)
  assert.equal(
    cells.filter(cell => lookup.has(seatCoordinateKey(cell))).length,
    3,
  )
  assert.equal(serializeSeats(lookup.values()).length, 3)
})

test('painting creates only the target seat and repainting the same type is idempotent', () => {
  const seats = createSeatLookup(sparse)
  const painted = paintHallSeat(seats, 3, 2, 'standard', 'paint')
  assert.equal(painted.size, 4)
  assert.equal(seats.size, 3)
  assert.strictEqual(paintHallSeat(painted, 3, 2, 'standard', 'paint'), painted)
  const repainted = paintHallSeat(painted, 3, 2, 'vip', 'paint')
  assert.equal(repainted.get('3:2')?.seatTypeId, 'vip')
  assert.equal(repainted.size, 4)
})

test('eraser removes only existing seats and never fills empty cells', () => {
  const seats = createSeatLookup(sparse)
  const erased = paintHallSeat(seats, 2, 2, undefined, 'erase')
  assert.equal(erased.size, 2)
  assert.equal(erased.has('2:2'), false)
  assert.strictEqual(paintHallSeat(erased, 2, 2, undefined, 'erase'), erased)
  assert.equal(serializeSeats(erased.values()).length, 2)
})

test('serialization is deterministic, strips persisted fields, and does not mutate input', () => {
  const reversed = [...sparse].reverse()
  const serialized = serializeSeats(
    reversed.map(seat => ({ ...seat, id: 'persisted', number: 99 })),
  )
  assert.deepEqual(serialized, sparse)
  assert.equal(reversed[0].gridX, 12)
})

test('layout comparison ignores order/IDs/numbers but detects moves, erasures, types and dimensions', () => {
  const original = { rows: 13, seatsPerRow: 12, seats: sparse }
  assert.equal(
    layoutsEqual(original, { ...original, seats: [...sparse].reverse() }),
    true,
  )
  assert.equal(layoutsEqual(original, { ...original, rows: 14 }), false)
  assert.equal(
    layoutsEqual(original, { ...original, seats: sparse.slice(1) }),
    false,
  )
  assert.equal(
    layoutsEqual(original, {
      ...original,
      seats: sparse.map(seat => ({ ...seat, gridX: seat.gridX + 1 })),
    }),
    false,
  )
  assert.equal(
    layoutsEqual(original, {
      ...original,
      seats: sparse.map(seat => ({ ...seat, seatTypeId: 'other' })),
    }),
    false,
  )
})

test('resize identifies seats that would be lost without changing the draft', () => {
  assert.deepEqual(seatsOutsideBounds(sparse, 12, 12), [sparse[2]])
  assert.deepEqual(seatsOutsideBounds(sparse, 13, 12), [])
  assert.equal(sparse.length, 3)
})

test('empty layouts have zero bounds and generate no seats', () => {
  assert.deepEqual(getSeatBounds([]), { rows: 0, cols: 0 })
  assert.deepEqual(getGridCells(0, 0), [])
  assert.deepEqual(serializeSeats([]), [])
})

test('painting at the seat limit permits repainting and erasing but prevents new seats', () => {
  const seats = createSeatLookup(createRectangularSeats(100, 100, 'standard'))
  assert.strictEqual(paintHallSeat(seats, 101, 1, 'vip', 'paint'), seats)
  const repainted = paintHallSeat(seats, 1, 1, 'vip', 'paint')
  assert.equal(repainted.get('1:1')?.seatTypeId, 'vip')
  assert.equal(paintHallSeat(repainted, 1, 1, undefined, 'erase').size, 9999)
})

test('only Active non-occupied seats are eligible; persistent and session statuses are independent', () => {
  assert.equal(
    isSeatAvailable({ id: 'Seat-A', status: 'Active' }, new Set()),
    true,
  )
  assert.equal(
    isSeatAvailable({ id: 'Seat-A', status: 'Active' }, new Set(['seat-a'])),
    false,
  )
  for (const status of [
    'Maintenance',
    'Reserved',
    'Sold',
    'Locked',
    '',
    'Unknown',
  ]) {
    assert.equal(isSeatAvailable({ id: 'Seat-A', status }, new Set()), false)
  }
})
