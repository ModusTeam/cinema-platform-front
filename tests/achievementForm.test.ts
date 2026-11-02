import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import type { AdminAchievementDto } from '@/features/admin/api/admin-achievements.service'
import {
  ACHIEVEMENT_ACTIONS,
  achievementSchema,
  buildAchievementPayload,
  DEFAULT_ACHIEVEMENT_VALUES,
  getAchievementFormDefaults,
  parseCriteriaDefaults,
  serializeCriteria,
  switchCriteriaMode,
} from '@/features/admin/model/achievementForm'

const valid = {
  ...DEFAULT_ACHIEVEMENT_VALUES,
  code: 'FIRST_TICKET',
  name: 'Перший квиток',
  description: 'Придбайте квиток',
}
const rule = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    field: 'TICKET_PURCHASED',
    operator: 'gte',
    target: 5,
    ...overrides,
  })
const jsonForm = (criteriaJson: string) => ({
  ...valid,
  ...parseCriteriaDefaults(criteriaJson),
})

describe('criteria preservation', () => {
  it('round-trips supported actions and both operators without changing their meaning', () => {
    for (const field of ACHIEVEMENT_ACTIONS) {
      for (const operator of ['gte', 'sum']) {
        const criteria = rule({ field, operator })
        assert.deepEqual(
          JSON.parse(buildAchievementPayload(jsonForm(criteria)).criteriaJson),
          JSON.parse(criteria),
        )
      }
    }
  })

  it('keeps sum and valueField in JSON mode, including an omitted server-default valueField', () => {
    for (const criteriaJson of [
      rule({ operator: 'sum', valueField: 'ticketCount' }),
      rule({ operator: 'sum' }),
    ]) {
      const state = parseCriteriaDefaults(criteriaJson)
      assert.equal(state.criteriaMode, 'json')
      assert.equal(serializeCriteria(state), criteriaJson)
      assert.equal(switchCriteriaMode(state, 'builder'), null)
      assert.equal(
        buildAchievementPayload({ ...valid, ...state }).criteriaJson,
        criteriaJson,
      )
    }
  })

  it('synchronizes current values in both directions when switching modes', () => {
    const json = switchCriteriaMode(
      { ...parseCriteriaDefaults(rule()), criteriaTarget: 12 },
      'json',
    )
    assert.ok(json)
    assert.equal(JSON.parse(json.criteriaJson).target, 12)
    const builder = switchCriteriaMode(
      { ...json, criteriaJson: rule({ target: 18 }) },
      'builder',
    )
    assert.ok(builder)
    assert.equal(builder.criteriaTarget, 18)
    assert.equal(
      JSON.parse(buildAchievementPayload({ ...valid, ...builder }).criteriaJson)
        .target,
      18,
    )
  })

  it('retains complex, unknown, extra and malformed rules instead of simplifying them', () => {
    for (const criteriaJson of [
      rule({ extra: { films: [1, 2] } }),
      rule({ operator: '>=' }),
      rule({ field: 'VISITS' }),
      '{"all":[]}',
      '[{}]',
      '{broken',
    ]) {
      const state = parseCriteriaDefaults(criteriaJson)
      assert.equal(state.criteriaMode, 'json')
      assert.equal(serializeCriteria(state), criteriaJson)
      assert.equal(switchCriteriaMode(state, 'builder'), null)
      assert.equal(
        achievementSchema.safeParse({ ...valid, ...state }).success,
        false,
      )
      assert.equal(state.criteriaJson, criteriaJson)
    }
  })

  it('blocks fields the server would silently discard and explains the reason', () => {
    for (const criteriaJson of [
      rule({ extra: 1 }),
      rule({ valueField: 'amount' }),
    ]) {
      const result = achievementSchema.safeParse(jsonForm(criteriaJson))
      assert.equal(result.success, false)
      if (!result.success)
        assert.ok(
          result.error.issues.some(issue => issue.message.includes('Сервер')),
        )
    }
  })
})

describe('achievement validation and submission', () => {
  it('requires positive integer targets with the NestJS upper bound in both modes', () => {
    for (const target of [-1, 0, 1.5, 1_000_000_001, Number.NaN, Infinity]) {
      assert.equal(
        achievementSchema.safeParse({ ...valid, criteriaTarget: target })
          .success,
        false,
      )
      assert.equal(
        achievementSchema.safeParse({
          ...valid,
          criteriaMode: 'json',
          criteriaJson: rule({ target }),
        }).success,
        false,
      )
    }
    for (const target of [1, 1_000_000_000]) {
      assert.equal(
        achievementSchema.safeParse({ ...valid, criteriaTarget: target })
          .success,
        true,
      )
    }
  })

  it('enforces text, optional valueField and reward/order limits', () => {
    for (const [field, limit] of [
      ['code', 64],
      ['name', 128],
      ['description', 10_000],
      ['icon', 128],
    ] as const) {
      assert.equal(
        achievementSchema.safeParse({ ...valid, [field]: 'X'.repeat(limit) })
          .success,
        true,
      )
      assert.equal(
        achievementSchema.safeParse({
          ...valid,
          [field]: 'X'.repeat(limit + 1),
        }).success,
        false,
      )
    }
    for (const valueField of ['', ' ', 'x'.repeat(65), null, 12]) {
      assert.equal(
        achievementSchema.safeParse(
          jsonForm(rule({ operator: 'sum', valueField })),
        ).success,
        false,
      )
    }
    assert.equal(
      achievementSchema.safeParse(
        jsonForm(rule({ operator: 'sum', valueField: 'x'.repeat(64) })),
      ).success,
      true,
    )
    for (const change of [
      { rewardPoints: -1 },
      { rewardPoints: 0.5 },
      { rewardPoints: 1_000_001 },
      { sortOrder: -32769 },
      { sortOrder: 32768 },
      { sortOrder: 0.5 },
      { category: 1.5 },
      { icon: '  ' },
    ]) {
      assert.equal(
        achievementSchema.safeParse({ ...valid, ...change }).success,
        false,
      )
    }
  })

  it('sends the existing API shape, with no editor state, while preserving an unknown icon', () => {
    const payload = buildAchievementPayload({
      ...valid,
      name: ' Назва ',
      icon: 'unknown:original',
      secretHint: ' Підказка ',
    })
    assert.deepEqual(payload, {
      code: 'FIRST_TICKET',
      name: 'Назва',
      description: valid.description,
      secretHint: 'Підказка',
      isSecret: false,
      icon: 'unknown:original',
      category: 1,
      rarity: 1,
      strategy: 1,
      rewardPoints: 0,
      sortOrder: 0,
      isActive: true,
      criteriaJson: JSON.stringify(
        { field: 'TICKET_PURCHASED', operator: 'gte', target: 1 },
        null,
        2,
      ),
    })
  })

  it('loads existing sum criteria, unknown artwork and metadata without losing fields', () => {
    const dto: AdminAchievementDto = {
      ...buildAchievementPayload(valid),
      id: 'existing',
      icon: 'historic-icon',
      criteriaJson: rule({ operator: 'sum', valueField: 'amount' }),
      createdAt: '',
      updatedAt: '',
    }
    const state = getAchievementFormDefaults(dto)
    assert.equal(state.criteriaMode, 'json')
    assert.equal(buildAchievementPayload(state).criteriaJson, dto.criteriaJson)
    assert.equal(buildAchievementPayload(state).icon, dto.icon)
  })

  it('keeps the editable snapshot intact for retry after a rejected save', async () => {
    const state = Object.freeze(
      jsonForm(rule({ operator: 'sum', valueField: 'amount' })),
    )
    const before = { ...state }
    const failingSave = async (
      _payload: ReturnType<typeof buildAchievementPayload>,
    ) => {
      throw new Error('save failed')
    }
    await assert.rejects(
      failingSave(buildAchievementPayload(state)),
      /save failed/,
    )
    assert.deepEqual(state, before)
    assert.equal(
      buildAchievementPayload(state).criteriaJson,
      before.criteriaJson,
    )
  })
})
