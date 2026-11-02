import { describe, it, spyOn } from 'bun:test'
import assert from 'node:assert/strict'
import {
  Award,
  BadgeCheck,
  CalendarClock,
  Clock,
  Coins,
  Flame,
  Lock,
  Medal,
  Star,
  Ticket,
  Trophy,
} from 'lucide-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AchievementIcon } from '@/features/loyalty/achievements/AchievementIcon'
import {
  ICON_SEARCH_LIMIT,
  loadAchievementIcon,
  searchAchievementIcons,
} from '@/features/loyalty/achievements/achievementIconApi'
import {
  CURATED_ACHIEVEMENT_ICONS,
  resolveAchievementIcon,
} from '@/features/loyalty/achievements/achievementIcons'

describe('achievement artwork registry', () => {
  it('bundles exactly the approved 30 icons with labels, keywords and actual artwork', () => {
    const names = [
      'film',
      'clapperboard',
      'projector',
      'ticket',
      'popcorn',
      'armchair',
      'camera',
      'video-camera',
      'captions',
      'glasses',
      'speaker',
      'headphones',
      'music-note',
      'aperture',
      'disc',
      'award',
      'medal',
      'trophy',
      'star',
      'crown',
      'gem',
      'sparkles',
      'users',
      'heart',
      'calendar-check',
      'clock',
      'moon',
      'sunrise',
      'ghost',
      'rocket',
    ]
    assert.deepEqual(
      CURATED_ACHIEVEMENT_ICONS.map(icon => icon.id),
      names.map(name => `withicons-retro:${name}`),
    )
    for (const icon of CURATED_ACHIEVEMENT_ICONS) {
      assert.match(icon.label, /[а-яіїєґ]/i)
      assert.match(icon.keywords, /[a-z]/)
      assert.ok(icon.data.body.includes('<path'))
      const result = resolveAchievementIcon(icon.id)
      assert.equal(result.kind, 'curated')
      if (result.kind === 'curated') assert.equal(result.icon.data, icon.data)
      const html = renderToStaticMarkup(
        createElement(AchievementIcon, { identifier: icon.id }),
      )
      assert.ok(html.includes('<svg'))
      assert.ok(html.includes('fill='))
    }
  })

  it('preserves all persisted Lucide identifiers and their aliases', () => {
    const legacy = {
      award: Award,
      badge: BadgeCheck,
      badge_check: BadgeCheck,
      calendar: CalendarClock,
      clock: Clock,
      coins: Coins,
      flame: Flame,
      medal: Medal,
      star: Star,
      ticket: Ticket,
      trophy: Trophy,
    }
    for (const [name, component] of Object.entries(legacy)) {
      assert.deepEqual(resolveAchievementIcon(name), {
        kind: 'legacy',
        component,
      })
    }
    assert.deepEqual(resolveAchievementIcon(' Badge-Check '), {
      kind: 'legacy',
      component: BadgeCheck,
    })
  })

  it('resolves namespaces before legacy names and restricts remote artwork', () => {
    assert.equal(
      resolveAchievementIcon('withicons-retro:ticket').kind,
      'curated',
    )
    assert.deepEqual(resolveAchievementIcon('withicons-retro:coffee'), {
      kind: 'remote',
      id: 'withicons-retro:coffee',
    })
    for (const identifier of [
      'other:ticket',
      'withicons-retro:../ticket',
      'new_icon',
        'constructor',
        'hasOwnProperty',
      '',
      undefined,
    ]) {
      assert.deepEqual(resolveAchievementIcon(identifier), {
        kind: 'unknown',
        component: Trophy,
      })
    }
  })

  it('trims normalized boundary separators and preserves internal ones', () => {
    for (const identifier of [
      '___BADGE_CHECK',
      'BADGE_CHECK___',
      '___Badge---Check___',
      `${'_'.repeat(100_000)}BADGE_CHECK${'_'.repeat(100_000)}`,
    ])
      assert.deepEqual(resolveAchievementIcon(identifier), {
        kind: 'legacy',
        component: BadgeCheck,
      })
    assert.equal(resolveAchievementIcon('a_'.repeat(100_000)).kind, 'unknown')
    assert.equal(resolveAchievementIcon('_'.repeat(100_000)).kind, 'unknown')
  })

  it('masks every secret before resolving or requesting its real artwork', () => {
    for (const identifier of [
      'withicons-retro:coffee',
      'withicons-retro:film',
      'ticket',
      'unknown',
    ]) {
      assert.deepEqual(resolveAchievementIcon(identifier, true), {
        kind: 'secret',
        component: Lock,
      })
      // No QueryClient is needed: a masked remote icon never mounts its network component.
      const html = renderToStaticMarkup(
        createElement(AchievementIcon, { identifier, hidden: true }),
      )
      assert.ok(html.includes('lucide-lock'))
      assert.ok(!html.includes(identifier))
    }
  })
})

describe('approved collection API', () => {
  it('restricts and bounds search results even if the API returns unrelated sets', async () => {
    const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          icons: [
            'other:coffee',
            ...Array.from(
              { length: 40 },
              (_, i) => `withicons-retro:coffee-${i}`,
            ),
          ],
        }),
      ),
    )
    try {
      const result = await searchAchievementIcons(
        'coffee',
        new AbortController().signal,
      )
      const url = new URL(String(fetchMock.mock.calls[0][0]))
      assert.equal(url.searchParams.get('prefix'), 'withicons-retro')
      assert.equal(url.searchParams.get('limit'), '32')
      assert.equal(result.length, ICON_SEARCH_LIMIT)
      assert.ok(result.every(id => id.startsWith('withicons-retro:')))
    } finally {
      fetchMock.mockRestore()
    }
  })

  it('reports outages and invalid responses separately from empty results', async () => {
    const fetchMock = spyOn(globalThis, 'fetch')
    try {
      fetchMock.mockResolvedValueOnce(
        new Response('unavailable', { status: 503 }),
      )
      await assert.rejects(
        searchAchievementIcons('coffee', new AbortController().signal),
      )
      fetchMock.mockResolvedValueOnce(new Response('{}'))
      await assert.rejects(
        searchAchievementIcons('coffee', new AbortController().signal),
      )
      fetchMock.mockResolvedValueOnce(new Response('{"icons":[]}'))
      assert.deepEqual(
        await searchAchievementIcons('coffee', new AbortController().signal),
        [],
      )
    } finally {
      fetchMock.mockRestore()
    }
  })

  it('loads only approved artwork and propagates cancellation', async () => {
    const fetchMock = spyOn(globalThis, 'fetch')
    try {
      await assert.rejects(
        loadAchievementIcon('other:coffee', new AbortController().signal),
      )
      assert.equal(fetchMock.mock.calls.length, 0)
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            width: 24,
            height: 24,
            icons: { coffee: { body: '<path d="M0 0"/>' } },
          }),
        ),
      )
      // Native XML parsing and successful rendering are checked in
      // achievementReview.browser.mjs. Bun has no DOMParser: fail closed.
      await assert.rejects(
        loadAchievementIcon(
          'withicons-retro:coffee',
          new AbortController().signal,
        ),
        /cannot be validated/,
      )
      const controller = new AbortController()
      controller.abort()
      fetchMock.mockImplementationOnce(async (_url, options) => {
        options?.signal?.throwIfAborted()
        throw new Error('request was not cancelled')
      })
      await assert.rejects(
        searchAchievementIcons('coffee', controller.signal),
        { name: 'AbortError' },
      )
    } finally {
      fetchMock.mockRestore()
    }
  })
})
