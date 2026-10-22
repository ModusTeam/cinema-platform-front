import * as signalR from '@microsoft/signalr'
import { getApiBaseUrl } from '@/shared/api/apiUrl'
import { normalizeId } from '@/shared/lib/normalizeId'

export const sessionGroup = (sessionId: string) =>
  `session:${normalizeId(sessionId)}`
export const resolveTicketHubUrl = (apiUrl: string, override?: string) => {
  if (!override?.trim()) return `${apiUrl.replace(/\/api\/?$/, '')}/tickets`
  const value = override.trim()
  if (value.startsWith('/') && !value.startsWith('//')) return value
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('VITE_TICKET_HUB_URL must use http(s) or a relative path')
  }
  return value
}

type HubConnection = Pick<
  signalR.HubConnection,
  'state' | 'start' | 'stop' | 'invoke' | 'on' | 'onreconnected' | 'onclose'
>

const createConnection = (): HubConnection =>
  new signalR.HubConnectionBuilder()
    .withUrl(
      resolveTicketHubUrl(getApiBaseUrl(), import.meta.env.VITE_TICKET_HUB_URL),
    )
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build()

export class TicketHubService {
  private connection: HubConnection | null = null
  private sessionId: string | null = null
  private requestedSessionId: string | null = null
  private generation = 0
  private operations: Promise<void> = Promise.resolve()
  private retryTimer: ReturnType<typeof setTimeout> | undefined
  private retries = 0
  private factory: () => HubConnection
  private schedule: typeof setTimeout
  private cancel: typeof clearTimeout

  public onSeatLocked: ((seatId: string, userId: string) => void) | null = null
  public onSeatUnlocked: ((seatId: string) => void) | null = null
  public onSynchronized: (() => void) | null = null

  constructor(
    factory: () => HubConnection = createConnection,
    schedule: typeof setTimeout = globalThis.setTimeout.bind(globalThis),
    cancel: typeof clearTimeout = globalThis.clearTimeout.bind(globalThis),
  ) {
    this.factory = factory
    this.schedule = schedule
    this.cancel = cancel
  }

  private ensureConnection() {
    if (this.connection) return this.connection
    const connection = this.factory()
    this.connection = connection
    connection.on(
      'SeatLocked',
      (sessionId: string, seatId: string, userId: string) => {
        if (this.accepts(sessionId))
          this.onSeatLocked?.(seatId, normalizeId(userId))
      },
    )
    connection.on('SeatUnlocked', (sessionId: string, seatId: string) => {
      if (this.accepts(sessionId)) this.onSeatUnlocked?.(seatId)
    })
    connection.onreconnected(() => {
      this.sessionId = null
      void this.enqueueJoin(this.generation)
    })
    connection.onclose(() => {
      this.sessionId = null
      this.scheduleRetry(this.generation)
    })
    return connection
  }

  private accepts(sessionId: string) {
    const id = normalizeId(sessionId)
    return id === this.sessionId && id === this.requestedSessionId
  }

  private clearRetry() {
    this.cancel(this.retryTimer)
    this.retryTimer = undefined
  }

  private scheduleRetry(generation: number) {
    const delays = [1000, 3000, 10_000]
    if (
      generation !== this.generation ||
      !this.requestedSessionId ||
      this.retryTimer ||
      this.retries >= delays.length
    )
      return
    this.retryTimer = this.schedule(
      () => {
        this.retryTimer = undefined
        void this.enqueueJoin(generation)
      },
      delays[this.retries++],
    )
  }

  private enqueueJoin(generation: number) {
    this.operations = this.operations
      .catch(() => {})
      .then(async () => {
        const target = this.requestedSessionId
        if (!target || generation !== this.generation) return
        try {
          const connection = this.ensureConnection()
          if (connection.state === signalR.HubConnectionState.Disconnected)
            await connection.start()
          if (generation !== this.generation) return
          if (connection.state !== signalR.HubConnectionState.Connected) return
          if (this.sessionId && this.sessionId !== target) {
            await connection.invoke(
              'LeaveSessionGroup',
              sessionGroup(this.sessionId),
            )
            this.sessionId = null
          }
          if (generation !== this.generation) return
          await connection.invoke('JoinSessionGroup', sessionGroup(target))
          if (generation !== this.generation) {
            await connection.invoke('LeaveSessionGroup', sessionGroup(target))
            return
          }
          this.sessionId = target
          this.retries = 0
          this.clearRetry()
          this.onSynchronized?.()
        } catch (error) {
          console.error('SignalR session synchronization failed:', error)
          this.scheduleRetry(generation)
        }
      })
    return this.operations
  }

  public startConnection(sessionId: string): Promise<void> {
    this.requestedSessionId = normalizeId(sessionId)
    this.generation += 1
    this.retries = 0
    this.clearRetry()
    return this.enqueueJoin(this.generation)
  }

  public stopConnection(): Promise<void> {
    this.requestedSessionId = null
    const generation = ++this.generation
    this.clearRetry()
    this.operations = this.operations
      .catch(() => {})
      .then(async () => {
        if (generation !== this.generation) return
        this.sessionId = null
        try {
          await this.connection?.stop()
        } catch (error) {
          console.error('SignalR disconnection failed:', error)
        }
      })
    return this.operations
  }
}

export const ticketHub = new TicketHubService()
