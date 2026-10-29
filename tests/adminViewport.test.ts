import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { adminViewportStore } from '@/features/admin/model/useAdminViewport'

describe('Admin viewport boundary', () => {
  it('switches at CSS pixel boundaries and releases every media listener', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
    let width = 390
    const queries = new Map<
      string,
      { matches: boolean; listeners: Set<() => void> }
    >()
    const matches = (query: string) => width >= Number(query.match(/\d+/)?.[0])
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        matchMedia: (query: string) => {
          let entry = queries.get(query)
          if (!entry) {
            entry = { matches: matches(query), listeners: new Set() }
            queries.set(query, entry)
          }
          return {
            get matches() {
              return matches(query)
            },
            addEventListener: (_event: string, listener: () => void) =>
              entry.listeners.add(listener),
            removeEventListener: (_event: string, listener: () => void) =>
              entry.listeners.delete(listener),
          }
        },
      },
    })
    let unsubscribe = () => {}
    try {
      const transitions: string[] = []
      unsubscribe = adminViewportStore.subscribe(() =>
        transitions.push(adminViewportStore.getSnapshot()),
      )
      assert.equal(adminViewportStore.getSnapshot(), 'unsupported')
      const resize = (nextWidth: number) => {
        width = nextWidth
        for (const [query, entry] of queries) {
          const next = matches(query)
          if (next === entry.matches) continue
          entry.matches = next
          for (const listener of entry.listeners) listener()
        }
      }
      for (const [nextWidth, expected] of [
        [767, 'unsupported'],
        [768, 'tablet'],
        [1023, 'tablet'],
        [1024, 'desktop'],
        [1440, 'desktop'],
        [767, 'unsupported'],
        [768, 'tablet'],
      ] as const) {
        resize(nextWidth)
        assert.equal(adminViewportStore.getSnapshot(), expected)
      }
      assert.deepEqual(transitions, [
        'tablet',
        'desktop',
        'unsupported',
        'unsupported',
        'tablet',
      ])
      unsubscribe()
      assert.ok(
        [...queries.values()].every(entry => entry.listeners.size === 0),
      )
      const count = transitions.length
      resize(1440)
      assert.equal(transitions.length, count)
    } finally {
      unsubscribe()
      if (originalWindow)
        Object.defineProperty(globalThis, 'window', originalWindow)
      else Reflect.deleteProperty(globalThis, 'window')
    }
  })
})
