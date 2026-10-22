import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HubConnectionState } from '@microsoft/signalr'
import {
  resolveTicketHubUrl,
  sessionGroup,
  TicketHubService,
} from '../src/features/booking/api/signalr.service'

class FakeHub {
  state: HubConnectionState = HubConnectionState.Disconnected
  handlers = new Map<string, (...args: string[]) => void>()
  reconnected = () => {}
  closed = () => {}
  calls: string[] = []
  beforeStart: (() => Promise<void>) | undefined
  beforeJoin: (() => Promise<void>) | undefined

  async start() {
    this.calls.push('start')
    await this.beforeStart?.()
    this.state = HubConnectionState.Connected
  }
  async stop() {
    this.calls.push('stop')
    this.state = HubConnectionState.Disconnected
    this.closed()
  }
  async invoke<T>(method: string, group: string): Promise<T> {
    this.calls.push(`${method}:${group}`)
    if (method === 'JoinSessionGroup') await this.beforeJoin?.()
    return undefined as T
  }
  on(event: string, handler: (...args: string[]) => void) {
    assert.equal(this.handlers.has(event), false, 'listeners registered once')
    this.handlers.set(event, handler)
  }
  onreconnected(handler: () => void) {
    this.reconnected = handler
  }
  onclose(handler: () => void) {
    this.closed = handler
  }
}

const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>(yes => {
    resolve = yes
  })
  return { promise, resolve }
}

test('initial join and reconnect synchronize occupancy; events are normalized hints', async () => {
  const connection = new FakeHub()
  const service = new TicketHubService(() => connection)
  let refreshes = 0
  const rejoined = deferred()
  service.onSynchronized = () => {
    if (++refreshes === 2) rejoined.resolve()
  }
  service.onSeatLocked = () => {
    refreshes += 1
  }
  service.onSeatUnlocked = () => {
    refreshes += 1
  }
  await service.startConnection('SESSION-A')
  assert.equal(refreshes, 1)
  connection.reconnected()
  await rejoined.promise
  connection.handlers.get('SeatLocked')!('SESSION-A', 'SEAT-A', 'USER-A')
  connection.handlers.get('SeatUnlocked')!('session-a', 'seat-a')
  assert.equal(refreshes, 4)
  assert.equal(
    connection.calls.filter(
      value => value === 'JoinSessionGroup:session:session-a',
    ).length,
    2,
  )
  await service.stopConnection()
})

test('session switches ignore old-session events and cleanup ignores all events', async () => {
  const connection = new FakeHub()
  const service = new TicketHubService(() => connection)
  let hints = 0
  service.onSeatUnlocked = () => {
    hints += 1
  }
  await service.startConnection('session-a')
  await service.startConnection('SESSION-B')
  connection.handlers.get('SeatUnlocked')!('session-a', 'seat-a')
  assert.equal(hints, 0)
  connection.handlers.get('SeatUnlocked')!('SESSION-B', 'seat-a')
  assert.equal(hints, 1)
  assert.ok(connection.calls.includes('LeaveSessionGroup:session:session-a'))
  await service.stopConnection()
  connection.handlers.get('SeatUnlocked')!('session-b', 'seat-a')
  assert.equal(hints, 1)
})

test('late connection start cannot join an abandoned session', async () => {
  const connection = new FakeHub()
  const service = new TicketHubService(() => connection)
  const started = deferred()
  const response = deferred()
  connection.beforeStart = async () => {
    started.resolve()
    await response.promise
  }
  let refreshes = 0
  service.onSynchronized = () => {
    refreshes += 1
  }
  const old = service.startConnection('session-a')
  await started.promise
  const stopped = service.stopConnection()
  const next = service.startConnection('session-b')
  response.resolve()
  await Promise.all([old, stopped, next])
  assert.equal(
    connection.calls.some(
      value => value === 'JoinSessionGroup:session:session-a',
    ),
    false,
  )
  assert.ok(connection.calls.includes('JoinSessionGroup:session:session-b'))
  assert.equal(refreshes, 1)
  await service.stopConnection()
})

test('late group join is left and cannot invoke newly installed callbacks', async () => {
  const connection = new FakeHub()
  const service = new TicketHubService(() => connection)
  const joining = deferred()
  const response = deferred()
  connection.beforeJoin = async () => {
    joining.resolve()
    await response.promise
  }
  let refreshes = 0
  service.onSynchronized = () => {
    refreshes += 1
  }
  const old = service.startConnection('session-a')
  await joining.promise
  const stopped = service.stopConnection()
  const next = service.startConnection('session-b')
  connection.beforeJoin = undefined
  response.resolve()
  await Promise.all([old, stopped, next])
  assert.equal(refreshes, 1)
  assert.ok(connection.calls.includes('LeaveSessionGroup:session:session-a'))
  await service.stopConnection()
})

test('initial failures retry with bounded delays and stop cancels further retries', async () => {
  const connection = new FakeHub()
  connection.beforeStart = async () => {
    throw new Error('offline')
  }
  const timers: Array<{ callback: () => void; delay: number }> = []
  const timer = setTimeout(() => {}, 60_000)
  clearTimeout(timer)
  const schedule = ((callback: () => void, delay: number) => {
    timers.push({ callback, delay })
    return timer
  }) as typeof setTimeout
  const service = new TicketHubService(() => connection, schedule)
  await service.startConnection('session-a')
  // Running the scheduled callback is synchronous; awaiting a turn lets the
  // serialized join finish and schedule its next bounded attempt.
  const flush = () => new Promise<void>(resolve => setImmediate(resolve))
  for (let i = 0; i < 3; i += 1) {
    assert.ok(timers[i])
    timers[i].callback()
    await flush()
  }
  assert.deepEqual(
    timers.map(value => value.delay),
    [1000, 3000, 10_000],
  )
  assert.equal(connection.calls.filter(value => value === 'start').length, 4)
  await service.stopConnection()
  timers.at(-1)!.callback()
  await flush()
  assert.equal(connection.calls.filter(value => value === 'start').length, 4)
})

test('hub URL keeps absolute defaults and permits explicit backend URL for relative API deployments', () => {
  assert.equal(
    resolveTicketHubUrl('https://cinema.example/api'),
    'https://cinema.example/tickets',
  )
  assert.equal(resolveTicketHubUrl('/api'), '/tickets')
  assert.equal(
    resolveTicketHubUrl('/api', 'https://cinema.example/tickets'),
    'https://cinema.example/tickets',
  )
  assert.throws(() => resolveTicketHubUrl('/api', 'javascript:alert(1)'))
  assert.equal(sessionGroup('SESSION-A'), 'session:session-a')
})
