import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  buildAchievementPayload,
  DEFAULT_ACHIEVEMENT_VALUES,
} from '@/features/admin/model/achievementForm'
import { buildAchievementPreview } from '@/features/admin/model/achievementPreview'
import { AchievementBadge } from '@/features/loyalty/achievements/AchievementBadge'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import {
  BADGE_RARITY_PRESENTATIONS,
  getBadgeProgressPercent,
  getBadgeRarityPresentation,
} from '@/features/loyalty/achievements/achievementBadgePresentation'
import { CURATED_ACHIEVEMENT_ICONS } from '@/features/loyalty/achievements/achievementIcons'

const values = Object.freeze({
  ...DEFAULT_ACHIEVEMENT_VALUES,
  code: 'FIRST_TICKET',
  name: 'Перший квиток',
  description: 'Придбайте квиток у кіно.',
  rarity: 5,
  rewardPoints: 125,
  icon: 'withicons-retro:film',
})
const badge = (props: Partial<Parameters<typeof AchievementBadge>[0]> = {}) =>
  renderToStaticMarkup(
    createElement(AchievementBadge, {
      rarity: 'common',
      status: 'locked',
      icon: values.icon,
      ...props,
    }),
  )
const card = (
  status: Parameters<typeof buildAchievementPreview>[1],
  overrides = {},
) =>
  renderToStaticMarkup(
    createElement(AchievementCard, {
      achievement: {
        ...buildAchievementPreview(values, status, false),
        ...overrides,
      },
    }),
  )

describe('collectible badge presentation', () => {
  it('gives every rarity a distinct rim structure and a centralized tone', () => {
    assert.deepEqual(BADGE_RARITY_PRESENTATIONS, {
      common: { tone: 'neutral', rim: 'single' },
      uncommon: { tone: 'green', rim: 'double' },
      rare: { tone: 'blue', rim: 'strong' },
      epic: { tone: 'violet', rim: 'marked' },
      legendary: { tone: 'gold', rim: 'etched' },
      unspecified: { tone: 'neutral', rim: 'single' },
    })
    for (const rarity of ['epic', 'legendary'] as const)
      assert.ok(badge({ rarity }).includes('achievement-badge__marks'))
    assert.ok(badge({ rarity: 'legendary' }).includes('stroke-dasharray="1 4"'))
  })

  it('falls back safely for unspecified, unknown and prototype names', () => {
    for (const rarity of [
      undefined,
      '',
      'future',
      'constructor',
      '__proto__',
      'unspecified',
    ])
      assert.deepEqual(getBadgeRarityPresentation(rarity), {
        tone: 'neutral',
        rim: 'single',
      })
  })

  it('keeps locked, progressing and server-confirmed unlocked states distinct', () => {
    const locked = badge({ progress: 35, target: 100 })
    assert.ok(locked.includes('data-state="locked"'))
    assert.ok(!locked.includes('achievement-badge__progress'))
    const progressing = badge({
      status: 'in-progress',
      progress: 35,
      target: 100,
    })
    assert.ok(progressing.includes('stroke-dashoffset="65"'))
    assert.ok(!progressing.includes('achievement-badge__complete'))
    const unconfirmed = badge({
      status: 'in-progress',
      progress: 100,
      target: 100,
    })
    assert.ok(unconfirmed.includes('data-state="in-progress"'))
    assert.ok(!unconfirmed.includes('achievement-badge__complete'))
    const unlocked = badge({ status: 'unlocked', progress: 0, target: 0 })
    assert.ok(unlocked.includes('stroke-dashoffset="0"'))
    assert.ok(unlocked.includes('achievement-badge__complete'))
  })

  it('clamps percentages and omits rings when progress or targets are unusable', () => {
    for (const [input, expected] of [
      [-20, 0],
      [0, 0],
      [35, 35],
      [100, 100],
      [120, 100],
    ]) {
      assert.equal(getBadgeProgressPercent(input, 100), expected)
      assert.ok(
        badge({ status: 'in-progress', progress: input, target: 100 }).includes(
          `stroke-dashoffset="${100 - expected}"`,
        ),
      )
    }
    for (const progress of [undefined, NaN, Infinity, -Infinity]) {
      assert.equal(getBadgeProgressPercent(progress, 100), null)
      assert.ok(
        !badge({ status: 'in-progress', progress, target: 100 }).includes(
          'achievement-badge__progress',
        ),
      )
    }
    for (const target of [undefined, 0, -1, NaN, Infinity]) {
      assert.equal(getBadgeProgressPercent(35, target), null)
      assert.ok(!card('in-progress', { target }).includes('<progress'))
      assert.ok(
        !badge({ status: 'in-progress', progress: 35, target }).includes(
          'achievement-badge__progress',
        ),
      )
    }
    assert.ok(!card('in-progress', { current: NaN }).includes('<progress'))
  })

  it('keeps one accessible progress element, numeric values, status and rarity text', () => {
    const markup = card('in-progress')
    assert.equal((markup.match(/<progress /g) ?? []).length, 1)
    assert.ok(markup.includes('aria-valuetext="35 з 100"'))
    assert.ok(markup.includes('value="35"'))
    assert.ok(markup.includes('Прогрес: 35 / 100'))
    assert.ok(markup.includes('У прогресі'))
    assert.ok(markup.includes('Легендарне'))
    assert.ok(markup.includes('aria-hidden="true" class="achievement-badge"'))
    assert.ok(!markup.includes('tabindex'))
    assert.ok(!markup.includes('role="button"'))
  })

  it('masks artwork, rarity structure, progress and concealed metadata for secrets', () => {
    const neutralSecret = badge({ hidden: true })
    for (const rarity of Object.keys(BADGE_RARITY_PRESENTATIONS)) {
      assert.deepEqual(getBadgeRarityPresentation(rarity, true), {
        tone: 'neutral',
        rim: 'single',
      })
    }
    for (const icon of [
      'withicons-retro:film',
      'withicons-retro:coffee',
      'ticket',
    ])
      for (const status of ['locked', 'in-progress', 'unlocked'] as const)
        assert.equal(
          badge({
            hidden: true,
            icon,
            rarity: 'legendary',
            status,
            progress: 35,
            target: 100,
          }),
          neutralSecret,
        )
    const masked = card('in-progress', {
      isSecret: true,
      secretHint: 'Публічна підказка',
    })
    for (const concealed of [
      values.name,
      values.description,
      'Легендарне',
      '125',
      '<progress',
      'data-tone="gold"',
    ])
      assert.ok(!masked.includes(concealed))
    assert.ok(masked.includes('Публічна підказка'))
    assert.ok(masked.includes('lucide-lock'))
    assert.ok(card('unlocked', { isSecret: true }).includes('data-tone="gold"'))
  })

  it('preserves all curated multicolor artwork, legacy icons and fallback at every size', () => {
    for (const { id, data } of CURATED_ACHIEVEMENT_ICONS) {
      const markup = badge({ icon: id })
      for (const fill of data.body.match(/fill="[^"]+"/g) ?? [])
        assert.ok(markup.includes(fill))
    }
    for (const size of ['small', 'medium', 'large'] as const) {
      assert.ok(badge({ icon: 'ticket', size }).includes('lucide-ticket'))
      assert.ok(badge({ icon: 'unknown', size }).includes('lucide-trophy'))
      assert.ok(badge({ size }).includes(`data-size="${size}"`))
      assert.ok(badge({ size }).includes('viewBox="0 0 104 104"'))
    }
  })
})

describe('isolated Admin badge simulation', () => {
  it('switches between all three states without fabricating locked progress', () => {
    for (const status of ['locked', 'in-progress', 'unlocked'] as const) {
      const preview = buildAchievementPreview(values, status, false)
      assert.equal(preview.status, status)
      assert.equal(preview.progressPercent, status === 'in-progress' ? 35 : 0)
      assert.equal(preview.target, status === 'in-progress' ? 100 : 0)
      assert.equal(preview.rarity, 'legendary')
      assert.equal(preview.icon, values.icon)
    }
  })

  it('forces secret guest masking even when an unlocked simulation is selected', () => {
    for (const status of ['locked', 'in-progress', 'unlocked'] as const) {
      const preview = buildAchievementPreview(
        { ...values, isSecret: true },
        status,
        true,
      )
      const markup = renderToStaticMarkup(
        createElement(AchievementCard, { achievement: preview, preview: true }),
      )
      assert.equal(preview.status, 'locked')
      assert.equal(preview.progressPercent, 0)
      assert.ok(markup.includes('Секретне досягнення'))
      assert.ok(!markup.includes('data-tone="gold"'))
      assert.ok(!markup.includes(values.name))
    }
  })

  it('updates editable presentation and leaves form values and submit payload intact', () => {
    const before = buildAchievementPayload(values)
    const changed = {
      ...values,
      name: 'Нова назва',
      description: 'Новий опис',
      icon: 'ticket',
      rarity: 3,
      rewardPoints: 40,
    }
    const preview = buildAchievementPreview(changed, 'in-progress', false)
    assert.equal(preview.title, changed.name)
    assert.equal(preview.description, changed.description)
    assert.equal(preview.icon, 'ticket')
    assert.equal(preview.rarity, 'rare')
    assert.equal(preview.pointsReward, 40)
    for (const status of ['locked', 'in-progress', 'unlocked'] as const) {
      buildAchievementPreview(values, status, true)
      assert.deepEqual(buildAchievementPayload(values), before)
    }
    assert.equal(JSON.parse(before.criteriaJson).target, 1)
    for (const field of [
      'status',
      'current',
      'target',
      'progressPercent',
      'guestView',
    ])
      assert.ok(!Object.hasOwn(before, field))
  })
})
