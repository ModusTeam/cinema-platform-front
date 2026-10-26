import { test } from 'bun:test'
import { strict as assert } from 'node:assert'
import {
  PRESENTATION_KEY,
  persistPresentation,
  readPresentation,
} from '../src/features/presentation/model/preference'

test('presentation defaults to Classic for absent, invalid, or unavailable storage', () => {
  for (const value of [null, '', 'festival', 'NEW', 'classic']) {
    assert.equal(readPresentation({ getItem: () => value }), 'classic')
  }
  assert.equal(
    readPresentation({
      getItem() {
        throw new Error('Denied')
      },
    }),
    'classic',
  )
})

test('explicit choices round-trip through storage and denied writes do not throw', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
  persistPresentation(storage, 'new')
  assert.equal(values.get(PRESENTATION_KEY), 'new')
  assert.equal(readPresentation(storage), 'new')
  persistPresentation(storage, 'classic')
  assert.equal(readPresentation(storage), 'classic')
  assert.doesNotThrow(() =>
    persistPresentation(
      {
        setItem() {
          throw new Error('Denied')
        },
      },
      'new',
    ),
  )
})
