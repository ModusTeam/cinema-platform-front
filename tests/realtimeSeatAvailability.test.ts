import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Seat } from '../src/entities/hall/model/hall.types'
import type {
  SessionAvailability,
  SessionSeatAvailability,
} from '../src/entities/session/model/session.types'
import {
  OCCUPANCY_POLL_INTERVAL,
  OccupancyRevision,
  shouldReconcile,
} from '../src/features/booking/lib/occupancyReconciliation'
import {
  classifySeat,
  ownsSeatLock,
} from '../src/features/booking/lib/seatState'
import { SeatSelection } from '../src/features/booking/model/seatSelection'

const seat: Seat = {
  id: 'SEAT-A',
  row: '1',
  number: 5,
  gridX: 5,
  gridY: 1,
  status: 'Active',
  seatTypeId: 'standard',
  seatTypeName: 'Standard',
}
const available: SessionSeatAvailability = {
  id: 'seat-a',
  row: 1,
  number: 5,
  rowLabel: '1',
  gridX: 5,
  gridY: 1,
  type: 'Standard',
  price: 150,
  isAvailable: true,
  isSold: false,
  isLocked: false,
  isLockedByCurrentUser: false,
}
const own = {
  ...available,
  isAvailable: false,
  isLocked: true,
  isLockedByCurrentUser: true,
}
const foreign = { ...own, isLockedByCurrentUser: false }
const sold = { ...foreign, isSold: true, isLocked: false }
const availability = (
  value = own,
  sessionId = 'session-a',
): SessionAvailability => ({
  sessionId,
  hallId: 'hall-a',
  movieTitle: 'Movie',
  startTime: '2026-10-23T20:00:00Z',
  seats: [value],
})
const deferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const fixture = (sessionId = 'session-a') => {
  const calls: string[] = []
  let data: SessionAvailability | undefined = availability(own, sessionId)
  const dependencies = {
    lock: async (session: string, id: string) => {
      calls.push(`lock:${session}:${id}`)
    },
    unlock: async (session: string, id: string) => {
      calls.push(`unlock:${session}:${id}`)
    },
    refresh: async () => {
      calls.push('refresh')
      return data
    },
    warn: (key: string) => {
      calls.push(key)
    },
  }
  const selection = new SeatSelection(sessionId, dependencies)
  return {
    selection,
    dependencies,
    calls,
    setData: (value: typeof data) => {
      data = value
    },
  }
}

test('seat precedence preserves maintenance and sold status over selection and locks', () => {
  assert.equal(
    classifySeat({ status: 'Maintenance' }, own, true, true),
    'maintenance',
  )
  assert.equal(
    classifySeat(seat, { ...sold, isLockedByCurrentUser: true }, true, true),
    'sold',
  )
  assert.equal(
    classifySeat({ status: 'Reserved' }, available, false, false),
    'sold',
  )
  assert.equal(classifySeat(seat, available, false, true), 'pending')
  assert.equal(classifySeat(seat, undefined, false, false), 'unknown')
})

test('own ownership and local selection remain distinct; foreign locks are disabled', () => {
  assert.equal(classifySeat(seat, available, false, false), 'available')
  assert.equal(classifySeat(seat, own, true, false), 'selected')
  assert.equal(classifySeat(seat, own, false, false), 'available')
  assert.equal(classifySeat(seat, foreign, true, false), 'locked')
  assert.equal(ownsSeatLock(sold), false)
  assert.equal(ownsSeatLock(available), false)
})

test('an unlock hint followed by authoritative sold occupancy never frees a purchased seat', async () => {
  const f = fixture()
  await f.selection.toggle(seat, false)
  // The event is only a refresh hint: the response still reports a reservation.
  f.setData(availability(sold))
  f.selection.reconcile((await f.dependencies.refresh())!)
  assert.deepEqual(f.selection.getSnapshot().seats, [])
  assert.equal(classifySeat(seat, sold, false, false), 'sold')
  assert.ok(f.calls.includes('selectionLost'))
  assert.equal(f.calls.filter(value => value.startsWith('unlock:')).length, 0)
})

test('lock success confirms selection, refreshes occupancy and normalizes GUID comparisons', async () => {
  const f = fixture('SESSION-A')
  await f.selection.toggle(seat, false)
  assert.equal(f.selection.getSnapshot().seats.length, 1)
  assert.equal(f.selection.getSnapshot().pending.size, 0)
  f.selection.reconcile(availability())
  assert.equal(f.selection.getSnapshot().seats.length, 1)
  assert.deepEqual(f.calls, ['lock:SESSION-A:SEAT-A', 'refresh'])
})

test('failed lock leaves no optimistic selection and always refreshes', async () => {
  const f = fixture()
  f.dependencies.lock = async () => {
    throw new Error('conflict')
  }
  await f.selection.toggle(seat, false)
  assert.deepEqual(f.selection.getSnapshot().seats, [])
  assert.equal(f.selection.getSnapshot().pending.size, 0)
  assert.deepEqual(f.calls, ['lockFailed', 'refresh'])
})

test('explicit deselection unlocks once and reconciles', async () => {
  const f = fixture()
  await f.selection.toggle(seat, false)
  f.setData(availability(available))
  await f.selection.toggle(seat, true)
  assert.deepEqual(f.selection.getSnapshot().seats, [])
  assert.equal(f.calls.filter(value => value.startsWith('unlock:')).length, 1)
  assert.equal(f.calls.filter(value => value === 'refresh').length, 2)
})

test('failed unlock retains confirmed selection and reports failure', async () => {
  const f = fixture()
  await f.selection.toggle(seat, false)
  f.dependencies.unlock = async () => {
    throw new Error('network')
  }
  await f.selection.toggle(seat, true)
  assert.equal(f.selection.getSnapshot().seats.length, 1)
  assert.ok(f.calls.includes('unlockFailed'))
  assert.equal(f.calls.at(-1), 'refresh')
})

test('select then deselect before lock response serializes lock then unlock', async () => {
  const f = fixture()
  const started = deferred<void>()
  const response = deferred<void>()
  f.dependencies.lock = async () => {
    f.calls.push('lock')
    started.resolve()
    await response.promise
  }
  const pending = f.selection.toggle(seat, false)
  assert.deepEqual([...f.selection.getSnapshot().pending], ['seat-a'])
  assert.equal(f.selection.getSnapshot().seats.length, 0)
  await started.promise
  await f.selection.toggle(seat, false)
  response.resolve()
  await pending
  assert.deepEqual(f.calls, ['lock', 'unlock:session-a:SEAT-A', 'refresh'])
  assert.deepEqual(f.selection.getSnapshot().seats, [])
})

test('unlock then reselect before response acquires only after release', async () => {
  const f = fixture()
  await f.selection.toggle(seat, false)
  const started = deferred<void>()
  const response = deferred<void>()
  f.dependencies.unlock = async () => {
    f.calls.push('unlock')
    started.resolve()
    await response.promise
  }
  const pending = f.selection.toggle(seat, true)
  await started.promise
  await f.selection.toggle(seat, true)
  response.resolve()
  await pending
  assert.equal(f.selection.getSnapshot().seats.length, 1)
  assert.deepEqual(f.calls.slice(2), [
    'unlock',
    'lock:session-a:SEAT-A',
    'refresh',
  ])
})

test('abandoned session late lock is released safely and cannot select in a new session', async () => {
  const old = fixture()
  const started = deferred<void>()
  const response = deferred<void>()
  old.dependencies.lock = async () => {
    started.resolve()
    await response.promise
  }
  const pending = old.selection.toggle(seat, false)
  await started.promise
  old.selection.abandon(true)
  const next = fixture('session-b')
  await next.selection.toggle(seat, false)
  response.resolve()
  await pending
  assert.deepEqual(old.selection.getSnapshot().seats, [])
  assert.equal(next.selection.getSnapshot().seats.length, 1)
  assert.ok(old.calls.includes('unlock:session-a:SEAT-A'))
})

test('returning to the same session waits for old cleanup before a new lock', async () => {
  const old = fixture()
  const started = deferred<void>()
  const response = deferred<void>()
  const order: string[] = []
  old.dependencies.lock = async () => {
    started.resolve()
    await response.promise
  }
  old.dependencies.unlock = async () => {
    order.push('old unlock')
  }
  const pending = old.selection.toggle(seat, false)
  await started.promise
  old.selection.abandon(true)
  const next = fixture()
  next.dependencies.lock = async () => {
    order.push('new lock')
  }
  const nextPending = next.selection.toggle(seat, false)
  response.resolve()
  await Promise.all([pending, nextPending])
  assert.deepEqual(order, ['old unlock', 'new lock'])
  assert.equal(next.selection.getSnapshot().seats.length, 1)
})

test('expired and foreign locks remove selected seats without guessing TTL', async () => {
  for (const state of [available, foreign]) {
    const f = fixture()
    await f.selection.toggle(seat, false)
    f.selection.reconcile(availability(state))
    assert.deepEqual(f.selection.getSnapshot().seats, [])
    assert.ok(f.calls.includes('selectionLost'))
  }
})

test('failed reconciliation preserves unavailable knowledge and acquired selection', async () => {
  const f = fixture()
  f.setData(undefined)
  await f.selection.toggle(seat, false)
  assert.equal(f.selection.getSnapshot().seats.length, 1)
  assert.equal(classifySeat(seat, foreign, false, false), 'locked')
  assert.equal(classifySeat(seat, undefined, false, false), 'unknown')
})

test('own locks from another tab are not auto-selected or automatically released', async () => {
  const f = fixture()
  f.selection.reconcile(availability())
  assert.equal(f.selection.getSnapshot().seats.length, 0)
  await f.selection.toggle(seat, true)
  f.selection.abandon(true)
  assert.equal(
    f.calls.some(value => value.startsWith('unlock:')),
    false,
  )
})

test('completion and generic unmount never release reservations or other-tab locks', async () => {
  for (const completed of [false, true]) {
    const f = fixture()
    await f.selection.toggle(seat, false)
    if (completed) f.selection.complete()
    f.selection.abandon(completed)
    assert.equal(
      f.calls.some(value => value.startsWith('unlock:')),
      false,
    )
  }
})

test('events during HTTP reads discard stale responses and fetch again before publishing', async () => {
  const revision = new OccupancyRevision()
  const first = deferred<string>()
  let reads = 0
  const result = revision.read(
    () => (++reads === 1 ? first.promise : Promise.resolve('sold')),
    new AbortController().signal,
  )
  revision.invalidate()
  first.resolve('available')
  assert.deepEqual(await result, {
    data: 'sold',
    revision: 1,
    source: revision.source,
  })
  assert.equal(reads, 2)
})

test('aborted old-session HTTP responses cannot publish into the next session', async () => {
  const revision = new OccupancyRevision()
  const response = deferred<string>()
  const abort = new AbortController()
  const result = revision.read(() => response.promise, abort.signal)
  abort.abort()
  response.resolve('old session')
  await assert.rejects(result)
})

test('polling runs every ten seconds only in active visible online booking', () => {
  assert.equal(OCCUPANCY_POLL_INTERVAL, 10_000)
  assert.equal(shouldReconcile(true, true, true), true)
  assert.equal(shouldReconcile(false, true, true), false) // leaving/completion
  assert.equal(shouldReconcile(true, false, true), false) // hidden
  assert.equal(shouldReconcile(true, true, false), false) // offline
  assert.equal(shouldReconcile(true, true, true), true) // visibility/network return
})
