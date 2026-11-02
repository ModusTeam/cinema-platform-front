import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import AchievementCollection from '@/features/loyalty/achievements/AchievementCollection'
import AchievementCollectionItem from '@/features/loyalty/achievements/AchievementCollectionItem'
import AchievementDetails from '@/features/loyalty/achievements/AchievementDetails'
import {
  achievementDetailsPath,
  filterAchievements,
  getCollectionCategory,
  selectFeaturedAchievement,
} from '@/features/loyalty/achievements/achievementCollectionModel'
import { getAchievementProgress } from '@/features/loyalty/achievements/achievementPresentation'
import type { Achievement } from '@/features/loyalty/achievements/achievements.types'
import { achievementQueryScope } from '@/features/loyalty/achievements/model/achievementQuery'

const sample = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: 'first-ticket',
  code: 'FIRST_TICKET',
  title: 'Перший квиток',
  description: 'Ваш перший похід у кіно.',
  status: 'unlocked',
  category: 'visits',
  categoryLabel: 'Візити',
  rarity: 'common',
  rarityLabel: 'Звичайне',
  strategy: 'threshold',
  strategyLabel: 'Прогрес',
  current: 1,
  target: 1,
  progressPercent: 100,
  pointsReward: 10,
  isSecret: false,
  icon: 'withicons-retro:film',
  unlockedAt: '2026-10-20T12:00:00Z',
  sortOrder: 1,
  ...overrides,
})
const samples = [
  sample(),
  sample({
    id: 'rare',
    title: 'Знавець кіно',
    status: 'in-progress',
    current: 7,
    target: 10,
    progressPercent: 70,
    rarity: 'rare',
    rarityLabel: 'Рідкісне',
    unlockedAt: undefined,
    sortOrder: 2,
  }),
  sample({
    id: 'legendary',
    title: 'Легенда кінозалу',
    rarity: 'legendary',
    rarityLabel: 'Легендарне',
    sortOrder: 3,
  }),
  sample({
    id: 'locked',
    title: 'Наступний сеанс',
    status: 'locked',
    current: 0,
    target: 0,
    progressPercent: 0,
    icon: 'ticket',
    unlockedAt: undefined,
    sortOrder: 4,
  }),
  sample({
    id: 'secret-id',
    title: 'CONCEALED_TITLE',
    description: 'CONCEALED_DESCRIPTION',
    code: 'CONCEALED_CRITERIA',
    category: 'spending',
    categoryLabel: 'CONCEALED_CATEGORY',
    icon: 'withicons-retro:coffee',
    status: 'in-progress',
    isSecret: true,
    secretHint: 'Попереду несподівана кіноісторія.',
    rarity: 'legendary',
    rarityLabel: 'CONCEALED_RARITY',
    current: 9876,
    target: 9999,
    progressPercent: 98.76,
    pointsReward: 54321,
    unlockedAt: undefined,
  }),
  sample({
    id: 'unknown-art',
    title: 'Невідомий малюнок',
    icon: 'unknown-artwork',
  }),
]

function render(element: ReturnType<typeof createElement>) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element))
}

describe('achievement collection and details', () => {
  it('renders a linked badge gallery and features a target only once', () => {
    const markup = render(
      createElement(AchievementCollection, {
        achievements: samples,
        category: 'all',
        status: 'all',
        search: '?status=all',
        onFilter() {},
        onReset() {},
      }),
    )
    assert.ok(markup.includes('<ul class="grid'))
    assert.ok(markup.includes('Відкрито 3 з 6'))
    assert.ok(markup.includes('Показано: 6'))
    assert.ok(markup.includes('Найближча ціль'))
    assert.equal(
      (markup.match(/href="\/profile\/achievements\/rare\?/g) ?? []).length,
      1,
    )
    assert.equal(
      (markup.match(/class="achievement-badge"/g) ?? []).length,
      samples.length,
    )
    assert.ok(markup.includes('lucide-trophy'))
  })

  it('combines category and status filters and masks secret categories', () => {
    assert.equal(filterAchievements(samples, 'visits', 'unlocked').length, 3)
    assert.deepEqual(
      filterAchievements(samples, 'secret', 'in-progress').map(item => item.id),
      ['secret-id'],
    )
    assert.equal(filterAchievements(samples, 'spending', 'all').length, 0)
    assert.deepEqual(getCollectionCategory(samples[4]), {
      key: 'secret',
      label: 'Секретні',
    })
    const markup = render(
      createElement(AchievementCollection, {
        achievements: samples,
        category: 'visits',
        status: 'locked',
        search: '',
        onFilter() {},
        onReset() {},
      }),
    )
    assert.ok(markup.includes('Показано: 1'))
    assert.ok(markup.includes('aria-pressed="true"'))
    assert.ok(!markup.includes('Найближча ціль'))
    assert.ok(!markup.includes('CONCEALED'))
  })

  it('offers a reset when filters have no matches', () => {
    const markup = render(
      createElement(AchievementCollection, {
        achievements: samples,
        category: 'secret',
        status: 'unlocked',
        search: '',
        onFilter() {},
        onReset() {},
      }),
    )
    assert.ok(markup.includes('За цими фільтрами досягнень немає'))
    assert.ok(markup.includes('Скинути фільтри'))
    assert.ok(!markup.includes('achievement-badge'))
  })

  it('selects the highest valid in-progress percentage deterministically without mutation', () => {
    const tied = [
      sample({ ...samples[1], id: 'z', sortOrder: 3 }),
      sample({ ...samples[1], id: 'b', sortOrder: 2 }),
      sample({ ...samples[1], id: 'a', sortOrder: 2 }),
    ]
    const original = [...tied]
    assert.equal(selectFeaturedAchievement(tied)?.id, 'a')
    assert.deepEqual(tied, original)
    assert.equal(selectFeaturedAchievement(samples)?.id, 'rare')
    assert.equal(
      selectFeaturedAchievement([samples[0], samples[3], samples[4]]),
      undefined,
    )
    for (const target of [0, -1, Infinity, NaN])
      assert.equal(
        selectFeaturedAchievement([sample({ ...samples[1], target })]),
        undefined,
      )
  })

  it('keeps valid 100% progress unearned until the server confirms unlock', () => {
    const markup = render(
      createElement(AchievementDetails, {
        achievement: sample({
          ...samples[1],
          current: 10,
          progressPercent: 100,
        }),
      }),
    )
    assert.ok(markup.includes('data-state="in-progress"'))
    assert.ok(markup.includes('value="100"'))
    assert.ok(!markup.includes('achievement-badge__complete'))
    assert.ok(markup.includes('За відкриття'))
  })

  it('shows one labelled native progress element and hides unusable progress', () => {
    const markup = render(
      createElement(AchievementDetails, { achievement: samples[1] }),
    )
    assert.equal((markup.match(/<progress /g) ?? []).length, 1)
    assert.ok(markup.includes('aria-valuetext="7 з 10"'))
    assert.ok(markup.includes('Прогрес: 7 / 10'))
    for (const overrides of [
      { target: 0 },
      { target: NaN },
      { current: Infinity },
      { progressPercent: NaN },
      { current: -1 },
    ]) {
      const item = sample({ ...samples[1], ...overrides })
      assert.equal(getAchievementProgress(item), null)
      assert.ok(
        !render(
          createElement(AchievementDetails, { achievement: item }),
        ).includes('<progress'),
      )
    }
  })

  it('preserves unlocked dates, rarity and completion, and distinct locked states', () => {
    const unlocked = render(
      createElement(AchievementDetails, { achievement: samples[2] }),
    )
    assert.ok(unlocked.includes('Легендарне'))
    assert.ok(
      unlocked.toLowerCase().includes('datetime="2026-10-20t12:00:00z"'),
    )
    assert.ok(unlocked.includes('achievement-badge__complete'))
    assert.ok(unlocked.includes('Нагорода: +10 балів'))
    const locked = render(
      createElement(AchievementDetails, { achievement: samples[3] }),
    )
    assert.ok(locked.includes('Ще не відкрито'))
    assert.ok(!locked.includes('<progress'))
    assert.ok(!locked.includes('achievement-badge__complete'))
  })

  it('masks every concealed value in tiles, detail content and accessible names', () => {
    for (const Component of [
      AchievementCollectionItem,
      AchievementDetails,
      AchievementCard,
    ]) {
      const markup = render(
        createElement(Component, { achievement: samples[4] }),
      )
      for (const forbidden of [
        'CONCEALED',
        'coffee',
        '9876',
        '9999',
        '54321',
        '<progress',
        'data-tone="gold"',
      ])
        assert.ok(
          !markup.includes(forbidden),
          `${Component.name} exposed ${forbidden}`,
        )
      assert.ok(markup.includes('Секретне досягнення'))
      assert.ok(markup.includes(samples[4].secretHint ?? ''))
      assert.ok(markup.includes('lucide-lock'))
    }
  })

  it('uses ID-only detail links and preserves filter search parameters', () => {
    assert.equal(
      achievementDetailsPath('id/with space', '?category=visits'),
      '/profile/achievements/id%2Fwith%20space?category=visits',
    )
    const markup = render(
      createElement(AchievementCollectionItem, {
        achievement: samples[4],
        search: '?status=locked',
      }),
    )
    assert.ok(
      markup.includes('href="/profile/achievements/secret-id?status=locked"'),
    )
    assert.ok(markup.includes('aria-label="Секретне досягнення — У прогресі"'))
    assert.ok(!markup.includes('<button'))
  })

  it('keeps Account previews small and navigable with full link semantics', () => {
    const markup = render(
      createElement(AchievementCard, {
        achievement: samples[0],
        badgeSize: 'small',
        to: achievementDetailsPath(samples[0].id),
      }),
    )
    assert.ok(markup.startsWith('<a '))
    assert.ok(markup.includes('data-size="small"'))
    assert.ok(markup.includes('href="/profile/achievements/first-ticket"'))
  })

  it('limits gallery movement to no-preference and retains visible keyboard focus', () => {
    const css = readFileSync(
      new URL(
        '../src/features/loyalty/achievements/achievementCollection.css',
        import.meta.url,
      ),
      'utf8',
    )
    assert.ok(css.includes('@media (prefers-reduced-motion: no-preference)'))
    assert.ok(css.includes(':focus-visible'))
    assert.ok(!css.includes('animation:'))
  })
})

describe('achievement user-session cache isolation', () => {
  it('never reuses a previous user result during a new user request', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    })
    const first = achievementQueryScope('achievements-tab', 'user-a')
    const second = achievementQueryScope('achievements-tab', 'user-b')
    client.setQueryData(first.queryKey, ['private-a'])
    let finish: (data: string[]) => void = () => {}
    const pending = new Promise<string[]>(resolve => {
      finish = resolve
    })
    const observer = new QueryObserver(client, {
      ...first,
      queryFn: async () => ['private-a'],
    })
    const unsubscribe = observer.subscribe(() => {})
    observer.setOptions({ ...second, queryFn: () => pending })
    assert.equal(observer.getCurrentResult().data, undefined)
    assert.equal(observer.getCurrentResult().isPending, true)
    finish(['private-b'])
    await client.fetchQuery({
      queryKey: second.queryKey,
      queryFn: () => pending,
    })
    assert.deepEqual(observer.getCurrentResult().data, ['private-b'])
    assert.deepEqual(client.getQueryData(first.queryKey), ['private-a'])
    unsubscribe()
    client.clear()
    assert.equal(client.getQueryCache().getAll().length, 0)
  })

  it('disables anonymous queries and isolates all three achievement cache prefixes', () => {
    for (const prefix of [
      'achievements-tab',
      'achievements-preview',
      'loyalty-achievements-preview',
    ]) {
      assert.equal(achievementQueryScope(prefix).enabled, false)
      assert.notDeepEqual(
        achievementQueryScope(prefix, 'a').queryKey,
        achievementQueryScope(prefix, 'b').queryKey,
      )
      const client = new QueryClient()
      let calls = 0
      const observer = new QueryObserver(client, {
        ...achievementQueryScope(prefix),
        queryFn: async () => {
          calls += 1
          return []
        },
      })
      const unsubscribe = observer.subscribe(() => {})
      assert.equal(calls, 0)
      unsubscribe()
      client.clear()
    }
  })
})
