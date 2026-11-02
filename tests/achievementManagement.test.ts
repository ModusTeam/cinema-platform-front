import { afterEach, describe, it, spyOn } from 'bun:test'
import assert from 'node:assert/strict'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import type { AxiosAdapter } from 'axios'
import {
  type AdminAchievementDto,
  adminAchievementsService,
} from '@/features/admin/api/admin-achievements.service'
import {
  CRITERIA_PRESETS,
  criteriaMeaning,
  getCriteriaSafetyError,
  getCriteriaSummary,
  parseCriteriaDefaults,
  serializeCriteria,
  switchCriteriaMode,
} from '@/features/admin/model/achievementCriteria'
import {
  buildAchievementPayload,
  buildAchievementReactivationPayload,
  DEFAULT_ACHIEVEMENT_VALUES,
  getAchievementFormDefaults,
  getMeaningfulAchievementChanges,
  getReactivationRestriction,
} from '@/features/admin/model/achievementForm'
import {
  achievementListKey,
  achievementPageOffset,
  DEFAULT_ACHIEVEMENT_FILTERS,
  filterAchievementPage,
  invalidateAchievementQueries,
  lastAchievementPage,
} from '@/features/admin/model/achievementManagement'
import { api } from '@/shared/api/axios'
import { tokenStorage } from '@/shared/api/tokenStorage'

const rule = (changes: Record<string, unknown> = {}) =>
  JSON.stringify({
    field: 'TICKET_PURCHASED',
    operator: 'gte',
    target: 5,
    ...changes,
  })
const dto = (
  changes: Partial<AdminAchievementDto> = {},
): AdminAchievementDto => ({
  id: 'achievement-1',
  code: 'FIVE_ORDERS',
  name: 'П’ять покупок',
  description: 'Опис',
  secretHint: 'Підказка',
  isSecret: true,
  icon: 'unknown:preserve-me',
  category: 1,
  rarity: 2,
  strategy: 3,
  criteriaJson: rule(),
  rewardPoints: 50,
  sortOrder: 12,
  isActive: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
  ...changes,
})

describe('verified presets and lossless criteria editing', () => {
  it('offers purchase counts and pre-redemption order value only', () => {
    assert.deepEqual(
      CRITERIA_PRESETS.map(item => item.value),
      ['purchase-count', 'purchase-amount'],
    )
    for (const preset of CRITERIA_PRESETS) {
      const json = serializeCriteria({
        ...DEFAULT_ACHIEVEMENT_VALUES,
        criteriaPreset: preset.value,
        criteriaTarget: 1000,
      })
      assert.deepEqual(JSON.parse(json), {
        field: 'TICKET_PURCHASED',
        operator: preset.value === 'purchase-count' ? 'gte' : 'sum',
        target: 1000,
      })
      const parsed = parseCriteriaDefaults(json)
      assert.equal(parsed.criteriaPreset, preset.value)
      assert.equal(parsed.criteriaTarget, 1000)
    }
  })
  it('preserves raw JSON, omitted defaults and explicit amount through mode switches and target edits', () => {
    for (const criteriaJson of [
      rule(),
      rule({ operator: 'sum' }),
      rule({ operator: 'sum', valueField: 'amount' }),
    ]) {
      const original = `  ${criteriaJson}\n`
      const builder = parseCriteriaDefaults(original)
      assert.equal(builder.criteriaMode, 'builder')
      assert.equal(serializeCriteria(builder), original)
      const json = switchCriteriaMode(builder, 'json')
      assert.ok(json)
      const back = switchCriteriaMode(json, 'builder')
      assert.ok(back)
      assert.equal(serializeCriteria(back), original)
      const updated = JSON.parse(
        serializeCriteria({ ...back, criteriaTarget: 9 }),
      )
      assert.deepEqual(updated, { ...JSON.parse(criteriaJson), target: 9 })
    }
  })
  it('never converts or silently discards complex/historical rules', () => {
    for (const criteriaJson of [
      rule({ field: 'REVIEW_LEFT' }),
      rule({ operator: 'sum', valueField: 'paidAmount' }),
      rule({ extra: { all: [1, 2] } }),
      rule({ operator: 'gte', valueField: 'amount' }),
      rule({ operator: 'sum', valueField: ' amount ' }),
      '{"all":[]}',
      '[{}]',
      '{broken',
    ]) {
      const state = parseCriteriaDefaults(criteriaJson)
      assert.equal(state.criteriaMode, 'json')
      assert.equal(serializeCriteria(state), criteriaJson)
      assert.equal(switchCriteriaMode(state, 'builder'), null)
    }
    assert.match(
      getCriteriaSafetyError(rule({ extra: 1 })) ?? '',
      /Сервер не зберігає/,
    )
    assert.equal(
      getCriteriaSafetyError(
        rule({ operator: 'sum', valueField: 'pointsUsed' }),
      ),
      null,
    )
  })
  it('synchronizes the current preset rather than resurrecting the previous mode', () => {
    const json = switchCriteriaMode(
      {
        ...parseCriteriaDefaults(rule()),
        criteriaPreset: 'purchase-amount',
        criteriaTarget: 500,
      },
      'json',
    )
    assert.ok(json)
    assert.equal(JSON.parse(json.criteriaJson).operator, 'sum')
    const back = switchCriteriaMode(
      { ...json, criteriaJson: rule({ target: 7 }) },
      'builder',
    )
    assert.ok(back)
    assert.equal(back.criteriaPreset, 'purchase-count')
    assert.equal(back.criteriaTarget, 7)
  })
  it('warns for meaning/reward/strategy changes but not spelling, formatting or equivalent defaults', () => {
    const initial = dto({
      criteriaJson: rule({ operator: 'sum' }),
      strategy: 1,
    })
    const defaults = getAchievementFormDefaults(initial)
    assert.deepEqual(
      getMeaningfulAchievementChanges(initial, {
        ...defaults,
        name: 'Виправлена назва',
        description: 'Новий опис',
        icon: 'trophy',
      }),
      [],
    )
    assert.deepEqual(
      getMeaningfulAchievementChanges(initial, {
        ...defaults,
        criteriaMode: 'json',
        criteriaJson: rule({ operator: 'sum', valueField: 'amount' }),
      }),
      [],
    )
    for (const change of [
      { criteriaTarget: 6 },
      { criteriaPreset: 'purchase-count' as const },
      { rewardPoints: 99 },
      { strategy: 2 },
      {
        criteriaMode: 'json' as const,
        criteriaJson: rule({ operator: 'sum', valueField: 'pointsUsed' }),
      },
      {
        criteriaMode: 'json' as const,
        criteriaJson: rule({ field: 'REVIEW_LEFT' }),
      },
    ]) {
      assert.equal(
        getMeaningfulAchievementChanges(initial, { ...defaults, ...change })
          .length,
        1,
      )
    }
    assert.deepEqual(
      getMeaningfulAchievementChanges(null, { ...defaults, rewardPoints: 100 }),
      [],
    )
    assert.equal(
      criteriaMeaning(rule({ operator: 'sum' })),
      criteriaMeaning(rule({ operator: 'sum', valueField: 'amount' })),
    )
  })
  it('formats precise summaries and marks unverified rules for review', () => {
    assert.equal(getCriteriaSummary(rule()).text, 'Щонайменше 5 покупок')
    assert.equal(
      getCriteriaSummary(rule({ target: 21 })).text,
      'Щонайменше 21 покупку',
    )
    assert.equal(
      getCriteriaSummary(rule({ target: 12 })).text,
      'Щонайменше 12 покупок',
    )
    const sum = getCriteriaSummary(rule({ operator: 'sum' }))
    assert.match(sum.text, /грн/)
    assert.match(sum.explanation, /округлюється/)
    assert.match(sum.explanation, /до списання балів/)
    assert.equal(sum.needsReview, false)
    for (const field of [
      'BULK_TICKET_PURCHASED',
      'REVIEW_LEFT',
      'VIP_SEAT_BOUGHT',
    ]) {
      const summary = getCriteriaSummary(rule({ field }))
      assert.equal(summary.needsReview, true)
      assert.doesNotMatch(summary.text, /відвіда|квитк|покуп/)
    }
    assert.equal(
      getCriteriaSummary(rule({ operator: 'sum', valueField: 'other' })).text,
      'Сума за полем other: 5',
    )
    assert.equal(getCriteriaSummary('{broken').needsReview, true)
    assert.equal(getCriteriaSummary(rule({ extra: 1 })).needsReview, true)
  })
})

describe('safe full-replacement activation', () => {
  it('changes only isActive, preserving criteria, artwork, strategy, reward and all metadata', () => {
    for (const icon of [
      'trophy',
      'withicons-retro:film',
      'unknown:preserve-me',
    ]) {
      const initial = dto({
        icon,
        criteriaJson: rule({ operator: 'sum', valueField: 'paidAmount' }),
      })
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...stored
      } = initial
      assert.deepEqual(buildAchievementReactivationPayload(initial), {
        ...stored,
        isActive: true,
      })
      assert.equal(getReactivationRestriction(initial), null)
      assert.equal(
        buildAchievementPayload(getAchievementFormDefaults(initial)).icon,
        icon,
      )
    }
  })
  it('blocks normalization/data loss instead of forcing a legacy record through PUT', () => {
    for (const change of [
      { criteriaJson: rule({ extra: 1 }) },
      { criteriaJson: rule({ valueField: 'amount' }) },
      { criteriaJson: '{broken' },
      { name: ' Name ' },
      { icon: ' trophy ' },
      { strategy: 99 },
    ]) {
      assert.throws(() => buildAchievementReactivationPayload(dto(change)))
      assert.ok(getReactivationRestriction(dto(change)))
    }
  })
})

describe('page-scoped filtering and cache correctness', () => {
  it('calculates bounded page offsets and recovers the last remaining page', () => {
    assert.deepEqual(
      [1, 2, 3, 4].map(page => achievementPageOffset(page, 20)),
      [0, 20, 40, 60],
    )
    assert.equal(achievementPageOffset(0, 20), 0)
    assert.equal(lastAchievementPage(61, 20), 4)
    assert.equal(lastAchievementPage(60, 20), 3)
    assert.equal(lastAchievementPage(0, 20), 1)
    assert.notDeepEqual(
      achievementListKey(1, 20, false),
      achievementListKey(2, 20, false),
    )
    assert.notDeepEqual(
      achievementListKey(1, 20, false),
      achievementListKey(1, 50, false),
    )
    assert.notDeepEqual(
      achievementListKey(1, 20, false),
      achievementListKey(1, 20, true),
    )
  })
  it('searches only loaded name/code and combines filters without altering catalogue counts', () => {
    const items = [
      dto({ id: '1', code: 'ALPHA', name: 'Покупки', isActive: true }),
      dto({
        id: '2',
        code: 'BETA',
        isSecret: false,
        category: 'spending',
        rarity: 'rare',
      }),
      dto({ id: '3', code: 'GAMMA', isActive: true, isSecret: false }),
    ]
    const all = { ...DEFAULT_ACHIEVEMENT_FILTERS, status: 'all' as const }
    assert.deepEqual(
      filterAchievementPage(items, { ...all, search: ' alpha ' }).map(
        x => x.id,
      ),
      ['1'],
    )
    assert.equal(
      filterAchievementPage(items, { ...all, search: 'ПОКУПКИ' }).length,
      1,
    )
    assert.equal(
      filterAchievementPage(items, { ...all, search: 'outside-loaded-page' })
        .length,
      0,
    )
    assert.equal(items.length, 3)
    assert.deepEqual(
      filterAchievementPage(items, {
        ...all,
        status: 'inactive',
        secret: 'regular',
        category: 'spending',
        rarity: 'rare',
      }).map(x => x.id),
      ['2'],
    )
    assert.deepEqual(
      filterAchievementPage(items, DEFAULT_ACHIEVEMENT_FILTERS).map(x => x.id),
      ['1', '3'],
    )
  })
  it('invalidates all admin pages and user previews while preserving unrelated caches', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const keys = [
      achievementListKey(1, 20, false),
      achievementListKey(4, 20, true),
      ['achievements-tab'],
      ['achievements-preview'],
      ['loyalty-achievements-preview'],
      ['movies'],
      ['achievement-icon', 'trophy'],
    ]
    for (const key of keys) client.setQueryData(key, [])
    let requests = 0
    const observer = new QueryObserver(client, {
      queryKey: keys[0],
      staleTime: Infinity,
      queryFn: async () => {
        requests++
        return []
      },
    })
    const unsubscribe = observer.subscribe(() => {})
    await invalidateAchievementQueries(client)
    assert.equal(requests, 1)
    for (const key of keys.slice(1, 5))
      assert.equal(client.getQueryState(key)?.isInvalidated, true)
    for (const key of keys.slice(5))
      assert.equal(client.getQueryState(key)?.isInvalidated, false)
    unsubscribe()
    client.clear()
  })
})

const originalAdapter = api.defaults.adapter
let tokenSpy: ReturnType<typeof spyOn> | undefined
afterEach(() => {
  api.defaults.adapter = originalAdapter
  tokenSpy?.mockRestore()
})
const mockApi = (adapter: AxiosAdapter) => {
  tokenSpy = spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null)
  api.defaults.adapter = adapter
}

describe('mocked achievement API contracts', () => {
  it('requests only supported pagination parameters and returns records beyond 50', async () => {
    mockApi(async config => {
      assert.equal(config.method, 'get')
      assert.equal(config.url, '/achievements')
      assert.deepEqual(config.params, {
        includeInactive: true,
        limit: 20,
        offset: 60,
      })
      return {
        data: { achievements: [dto({ id: '61' })], total: 61 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    })
    const result = await adminAchievementsService.getAll(
      true,
      20,
      achievementPageOffset(4, 20),
    )
    assert.equal(result.total, 61)
    assert.equal(result.achievements[0].id, '61')
  })
  it('deactivates with DELETE and reactivates with a complete unchanged PUT body', async () => {
    const initial = dto()
    let calls = 0
    mockApi(async config => {
      calls++
      assert.equal(config.url, `/achievements/${initial.id}`)
      if (config.method === 'delete') assert.equal(config.data, undefined)
      else {
        assert.equal(config.method, 'put')
        assert.deepEqual(JSON.parse(config.data), {
          ...buildAchievementReactivationPayload(initial),
          id: initial.id,
        })
      }
      return {
        data: initial,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    })
    await adminAchievementsService.deactivate(initial.id)
    await adminAchievementsService.update(
      initial.id,
      buildAchievementReactivationPayload(initial),
    )
    assert.equal(calls, 2)
  })
})
