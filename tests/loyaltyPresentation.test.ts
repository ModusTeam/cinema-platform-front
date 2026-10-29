import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { getAchievementPresentation } from '@/features/loyalty/achievements/achievementPresentation'
import type { Achievement } from '@/features/loyalty/achievements/achievements.types'
import { mapLoyaltyProfile } from '@/features/loyalty/lib/loyalty.mappers'
import type { LoyaltyTransaction } from '@/features/loyalty/model/loyalty.types'
import PointsHistoryTable from '@/features/loyalty/ui/PointsHistoryTable'
import TierCard from '@/features/loyalty/ui/TierCard'

const achievement: Achievement = {
  id: 'synthetic-achievement',
  code: 'TEST',
  title: 'Прихована назва',
  description: 'Прихована умова',
  status: 'locked',
  category: 'secret',
  categoryLabel: 'Секретні',
  rarity: 'legendary',
  rarityLabel: 'Легендарне',
  strategy: 'threshold',
  strategyLabel: 'Прогрес',
  current: 3,
  target: 5,
  progressPercent: 60,
  pointsReward: 125,
  isSecret: true,
  secretHint: 'Публічна підказка',
  icon: 'ticket',
  sortOrder: 1,
}
const renderAchievement = (overrides: Partial<Achievement> = {}) =>
  renderToStaticMarkup(
    createElement(AchievementCard, {
      achievement: { ...achievement, ...overrides },
    }),
  )

describe('achievement disclosure and status', () => {
  it('keeps unearned secrets masked even when partial progress is supplied', () => {
    for (const status of ['locked', 'in-progress'] as const) {
      const markup = renderAchievement({ status })
      assert.ok(markup.includes('Секретне досягнення'))
      assert.ok(markup.includes('Публічна підказка'))
      assert.ok(!markup.includes('Прихована назва'))
      assert.ok(!markup.includes('Прихована умова'))
      assert.ok(!markup.includes('125'))
      assert.ok(!markup.includes('<progress'))
      assert.ok(!markup.includes('Легендарне'))
    }
    assert.equal(
      getAchievementPresentation({ ...achievement, secretHint: '' })
        .description,
      'Умови відкриються після отримання досягнення.',
    )
  })

  it('reveals earned secrets and distinguishes awarded from prospective points', () => {
    const earned = renderAchievement({
      status: 'unlocked',
      unlockedAt: '2026-10-20T12:00:00Z',
    })
    assert.ok(earned.includes('Прихована назва'))
    assert.ok(earned.includes('Прихована умова'))
    assert.ok(earned.includes('Нагорода: +125 балів'))
    assert.ok(earned.includes('<time'))
    const progress = renderAchievement({
      isSecret: false,
      status: 'in-progress',
    })
    assert.ok(progress.includes('За відкриття: +125 балів'))
    assert.ok(progress.includes('aria-valuetext="3 з 5"'))
    assert.ok(progress.includes('value="60"'))
    assert.ok(progress.includes('У прогресі'))
  })
})

describe('membership and transaction presentation', () => {
  it('uses the existing mapped progression and reserves maximum-level copy for Gold', () => {
    const silver = mapLoyaltyProfile({ tier: 'Silver', points: 2450 })
    assert.equal(silver.progressPercent, 49)
    const markup = renderToStaticMarkup(
      createElement(TierCard, { tier: silver.tier, profile: silver }),
    )
    assert.ok(markup.includes('Прогрес до Gold'))
    assert.ok(!markup.includes('Максимальний рівень досягнуто'))
    const gold = mapLoyaltyProfile({ tier: 'Gold', points: 5000 })
    const maximum = renderToStaticMarkup(
      createElement(TierCard, { tier: gold.tier, profile: gold }),
    )
    assert.ok(maximum.includes('Максимальний рівень досягнуто'))
    assert.ok(!maximum.includes('<progress'))
  })

  it('retains loaded transactions when a later page fails, with signed changes and retry', () => {
    const transactions: LoyaltyTransaction[] = [
      {
        id: 'tx',
        type: 'ADMIN_DEDUCTION',
        points: -75,
        balanceAfter: 125,
        orderId: null,
        description: 'Reason: Тестове коригування',
        createdAt: '2026-10-20T12:00:00Z',
      },
    ]
    const markup = renderToStaticMarkup(
      createElement(PointsHistoryTable, {
        transactions,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        error: new Error('Synthetic page failure'),
        onLoadMore: () => {},
        onRetry: () => {},
      }),
    )
    assert.ok(markup.includes('-75'))
    assert.ok(markup.includes('Тестове коригування'))
    assert.ok(markup.includes('Баланс: 125'))
    assert.ok(markup.includes('Спробувати ще раз'))
    assert.ok(!markup.includes('Завантажити ще'))
    assert.ok(!markup.includes('Історія балів порожня'))
  })
})
