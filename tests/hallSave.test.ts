import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  type HallEditorSnapshot,
  saveHallChanges,
} from '../src/features/admin/lib/saveHallChanges'
import type { HallBuilderData } from '../src/features/admin/model/hallBuilder.types'

const seats = [{ gridX: 2, gridY: 1, seatTypeId: 'standard' }]
const original: HallEditorSnapshot = {
  id: 'hall',
  name: 'Зал',
  technologyIds: [],
  layout: { rows: 1, seatsPerRow: 2, seats },
}
const data: HallBuilderData = {
  rows: 1,
  cols: 2,
  seatConfig: seats,
  technologyIds: [],
  primarySeatTypeId: 'standard',
}

const setup = (failure?: 'layout' | 'technologies' | 'inactive') => {
  const calls: Array<{ method: string; args: unknown[] }> = []
  const service = {
    create: async (...args: unknown[]) => {
      calls.push({ method: 'create', args })
      return 'new-hall'
    },
    replaceLayout: async (...args: unknown[]) => {
      calls.push({ method: 'layout', args })
      if (failure === 'layout' || failure === 'inactive')
        throw Object.assign(new Error('Conflict'), {
          isAxiosError: true,
          response: {
            status: 409,
            data: {
              code:
                failure === 'inactive' ? 'Hall.Inactive' : 'Hall.LayoutLocked',
            },
          },
        })
    },
    update: async (...args: unknown[]) => {
      calls.push({ method: 'name', args })
    },
    updateTechnologies: async (...args: unknown[]) => {
      calls.push({ method: 'technologies', args })
      if (failure === 'technologies') throw new Error('Технології недоступні')
    },
  }
  return { service, calls }
}
const editInput = {
  mode: 'edit' as const,
  hallId: 'hall',
  hallName: 'Зал',
  data,
  original,
  scope: 'all' as const,
}

test('creation sends entire sparse layout in one POST with no follow-up requests', async () => {
  const { service, calls } = setup()
  const draft = {
    ...data,
    rows: 3,
    cols: 5,
    seatConfig: [...seats, { gridX: 5, gridY: 3, seatTypeId: 'vip' }],
  }
  const result = await saveHallChanges(service, {
    ...editInput,
    mode: 'create',
    hallId: null,
    original: null,
    data: draft,
  })
  assert.equal(result.success, true)
  assert.deepEqual(
    calls.map(call => call.method),
    ['create'],
  )
  assert.deepEqual(calls[0].args, [
    'Зал',
    3,
    5,
    'standard',
    [],
    draft.seatConfig,
  ])
})

test('rectangular creation also sends explicit seats', async () => {
  const { service, calls } = setup()
  const rectangle = [{ gridX: 1, gridY: 1, seatTypeId: 'standard' }, ...seats]
  await saveHallChanges(service, {
    ...editInput,
    mode: 'create',
    data: { ...data, seatConfig: rectangle },
  })
  assert.deepEqual(calls[0].args[5], rectangle)
})

test('unchanged edit makes no requests', async () => {
  const { service, calls } = setup()
  assert.equal((await saveHallChanges(service, editInput)).success, true)
  assert.deepEqual(calls, [])
})

test('metadata-only changes never call layout replacement', async () => {
  const { service, calls } = setup('layout')
  const result = await saveHallChanges(service, {
    ...editInput,
    hallName: 'Нова назва',
    data: { ...data, technologyIds: ['imax'] },
  })
  assert.equal(result.success, true)
  assert.deepEqual(
    calls.map(call => call.method),
    ['name', 'technologies'],
  )
})

test('reordered technology IDs do not trigger a metadata update', async () => {
  const { service, calls } = setup()
  const result = await saveHallChanges(service, {
    ...editInput,
    original: { ...original, technologyIds: ['technology-b', 'technology-a'] },
    data: { ...data, technologyIds: ['technology-a', 'technology-b'] },
  })
  assert.equal(result.success, true)
  assert.deepEqual(calls, [])
})

test('explicit metadata scope skips even an unsaved layout change', async () => {
  const { service, calls } = setup('layout')
  const result = await saveHallChanges(service, {
    ...editInput,
    scope: 'metadata',
    hallName: 'Інший зал',
    data: { ...data, seatConfig: [] },
  })
  assert.equal(result.success, true)
  assert.deepEqual(
    calls.map(call => call.method),
    ['name'],
  )
  assert.deepEqual(result.snapshot?.layout, original.layout)
})

test('locked layout fails without saving metadata, false success or draft mutation', async () => {
  const { service, calls } = setup('layout')
  const draft = { ...data, seatConfig: [{ ...seats[0], seatTypeId: 'vip' }] }
  const result = await saveHallChanges(service, {
    ...editInput,
    hallName: 'Нова назва',
    data: draft,
  })
  assert.equal(result.success, false)
  assert.equal(result.layoutLocked, true)
  assert.match(result.error ?? '', /історію сеансів/)
  assert.deepEqual(result.saved, [])
  assert.strictEqual(result.snapshot, original)
  assert.deepEqual(
    calls.map(call => call.method),
    ['layout'],
  )
  assert.equal(draft.seatConfig[0].seatTypeId, 'vip')
})

test('partial save reports successful parts and retry does not replace layout again', async () => {
  const { service, calls } = setup('technologies')
  const input = {
    ...editInput,
    hallName: 'Нова назва',
    data: { ...data, rows: 2, technologyIds: ['imax'] },
  }
  const result = await saveHallChanges(service, input)
  assert.equal(result.success, false)
  assert.deepEqual(result.saved, ['схему місць', 'назву'])
  assert.match(result.error ?? '', /Збережено схему місць, назву/)
  assert.deepEqual(
    calls.map(call => call.method),
    ['layout', 'name', 'technologies'],
  )
  calls.length = 0
  await saveHallChanges(service, { ...input, original: result.snapshot })
  assert.deepEqual(
    calls.map(call => call.method),
    ['technologies'],
  )
})

test('inactive hall gives a specific message and no metadata requests', async () => {
  const { service, calls } = setup('inactive')
  const result = await saveHallChanges(service, {
    ...editInput,
    data: { ...data, rows: 2 },
  })
  assert.equal(result.success, false)
  assert.match(result.error ?? '', /неактивного залу/)
  assert.deepEqual(
    calls.map(call => call.method),
    ['layout'],
  )
})

test('empty layout is rejected before any request', async () => {
  const { service, calls } = setup()
  const result = await saveHallChanges(service, {
    ...editInput,
    data: { ...data, seatConfig: [] },
  })
  assert.equal(result.success, false)
  assert.deepEqual(calls, [])
})
