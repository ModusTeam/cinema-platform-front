import type { Seat } from '@/entities/hall/model/hall.types'
import type { SessionAvailability } from '@/entities/session/model/session.types'
import { normalizeId } from '@/shared/lib/normalizeId'
import { ownsSeatLock } from '../lib/seatState'

interface SelectionSnapshot {
  seats: Seat[]
  pending: ReadonlySet<string>
}

interface SelectionDependencies {
  lock: (sessionId: string, seatId: string) => Promise<void>
  unlock: (sessionId: string, seatId: string) => Promise<void>
  refresh: () => Promise<SessionAvailability | undefined>
  warn: (message: 'lockFailed' | 'unlockFailed' | 'selectionLost') => void
}

interface SeatOperation {
  wanted: boolean
  releaseOnAbandon: boolean
}

// Serialize mutations across booking lifetimes too: a late cleanup must finish
// before a new selection for the same session/seat can acquire its lock.
const seatOperations = new Map<string, Promise<void>>()
const serializeSeat = (key: string, run: () => Promise<void>) => {
  const operation = (seatOperations.get(key) || Promise.resolve())
    .catch(() => {})
    .then(run)
  seatOperations.set(key, operation)
  void operation
    .finally(() => {
      if (seatOperations.get(key) === operation) seatOperations.delete(key)
    })
    .catch(() => {})
  return operation
}

export class SeatSelection {
  private snapshot: SelectionSnapshot = { seats: [], pending: new Set() }
  private listeners = new Set<() => void>()
  private operations = new Map<string, SeatOperation>()
  private freshLocks = new Set<string>()
  private active = true
  private completed = false
  private submitting = false
  private sessionId: string
  private dependencies: SelectionDependencies

  constructor(sessionId: string, dependencies: SelectionDependencies) {
    this.sessionId = sessionId
    this.dependencies = dependencies
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot
  isActive = () => this.active

  activate() {
    this.active = true
  }

  private publish(seats = this.snapshot.seats) {
    this.snapshot = { seats, pending: new Set(this.operations.keys()) }
    this.listeners.forEach(listener => listener())
  }

  reconcile(data: SessionAvailability) {
    if (
      !this.active ||
      this.completed ||
      this.submitting ||
      normalizeId(data.sessionId) !== normalizeId(this.sessionId)
    )
      return
    const occupancy = new Map(
      data.seats.map(seat => [normalizeId(seat.id), seat]),
    )
    const seats = this.snapshot.seats.filter(
      seat =>
        this.operations.has(normalizeId(seat.id)) ||
        ownsSeatLock(occupancy.get(normalizeId(seat.id))),
    )
    if (seats.length === this.snapshot.seats.length) return
    // A lost lock is no longer ours to release (it may already be sold).
    const remaining = new Set(seats.map(seat => normalizeId(seat.id)))
    this.freshLocks.forEach(id => {
      if (!remaining.has(id)) this.freshLocks.delete(id)
    })
    this.publish(seats)
    this.dependencies.warn('selectionLost')
  }

  toggle(seat: Seat, alreadyOwned: boolean): Promise<void> {
    if (!this.active || this.completed || this.submitting)
      return Promise.resolve()
    const id = normalizeId(seat.id)
    const existing = this.operations.get(id)
    if (existing) {
      existing.wanted = !existing.wanted
      return Promise.resolve()
    }
    const selected = this.snapshot.seats.some(
      value => normalizeId(value.id) === id,
    )
    const operation: SeatOperation = {
      wanted: !selected,
      releaseOnAbandon: false,
    }
    this.operations.set(id, operation)
    this.publish()
    return serializeSeat(`${normalizeId(this.sessionId)}:${id}`, async () => {
      const current = () => this.active && this.operations.get(id) === operation
      let held = selected
      let fresh = this.freshLocks.has(id)
      let action: 'lockFailed' | 'unlockFailed' = selected
        ? 'unlockFailed'
        : 'lockFailed'
      try {
        while (current() && held !== operation.wanted) {
          if (held) {
            action = 'unlockFailed'
            await this.dependencies.unlock(this.sessionId, seat.id)
            held = false
            fresh = false
            this.freshLocks.delete(id)
            if (current())
              this.publish(
                this.snapshot.seats.filter(
                  value => normalizeId(value.id) !== id,
                ),
              )
          } else {
            action = 'lockFailed'
            await this.dependencies.lock(this.sessionId, seat.id)
            held = true
            fresh = !alreadyOwned
            if (current()) {
              if (fresh) this.freshLocks.add(id)
              this.publish([...this.snapshot.seats, seat])
            }
          }
        }
        if (!current() && operation.releaseOnAbandon && held && fresh) {
          await this.dependencies.unlock(this.sessionId, seat.id)
        }
      } catch {
        if (current()) this.dependencies.warn(action)
      } finally {
        const data = await this.dependencies.refresh()
        if (current()) {
          this.operations.delete(id)
          this.publish()
          if (data) this.reconcile(data)
        }
      }
    })
  }

  setSubmitting(value: boolean) {
    this.submitting = value
  }

  complete() {
    this.completed = true
    this.freshLocks.clear()
  }

  abandon(release: boolean) {
    this.active = false
    const canRelease = release && !this.completed && !this.submitting
    this.operations.forEach(operation => {
      operation.releaseOnAbandon = canRelease
    })
    if (canRelease) {
      for (const seat of this.snapshot.seats) {
        const id = normalizeId(seat.id)
        // Locks already owned before this tab's selection may belong to another tab.
        if (!this.freshLocks.has(id) || this.operations.has(id)) continue
        void serializeSeat(`${normalizeId(this.sessionId)}:${id}`, async () => {
          try {
            await this.dependencies.unlock(this.sessionId, seat.id)
          } catch {
            this.dependencies.warn('unlockFailed')
          } finally {
            await this.dependencies.refresh()
          }
        })
      }
    }
    this.operations.clear()
    this.freshLocks.clear()
    this.publish([])
  }
}
