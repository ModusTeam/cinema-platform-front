export const OCCUPANCY_POLL_INTERVAL = 10_000

export const shouldReconcile = (
  active: boolean,
  visible: boolean,
  online: boolean,
) => active && visible && online

// Notifications during a read invalidate that read before it can be published.
export class OccupancyRevision {
  value = 0
  readonly source = Symbol('occupancy')
  active = true

  invalidate() {
    this.value += 1
  }

  async read<T>(load: () => Promise<T>, signal: AbortSignal) {
    for (;;) {
      signal.throwIfAborted()
      const revision = this.value
      const data = await load()
      signal.throwIfAborted()
      if (revision === this.value)
        return { data, revision, source: this.source }
    }
  }
}
