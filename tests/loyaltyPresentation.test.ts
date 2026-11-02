import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { getAchievementPresentation } from '@/features/loyalty/achievements/achievementPresentation'
import type { Achievement } from '@/features/loyalty/achievements/achievements.types'
import { mapLoyaltyProfile } from '@/features/loyalty/lib/loyalty.mappers'
import {
  formatSignedPoints,
  formatTransactionInfo,
  getTransactionPointsTone,
} from '@/features/loyalty/lib/loyaltyTransactionFormatters'
import type { LoyaltyTransaction } from '@/features/loyalty/model/loyalty.types'
import AchievementsPreview from '@/features/loyalty/ui/AchievementsPreview'
import MembershipCard from '@/features/loyalty/ui/MembershipCard'
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
  it('separates balance from status and annual metrics without guessing qualification progress', () => {
    const silver = mapLoyaltyProfile({
      tier: 'Silver',
      points: 2450,
      balance: 75,
      yearPoints: 3500,
      yearVisits: 12,
    })
    assert.equal(silver.pointsBalance, 75)
    assert.equal(silver.tier.label, 'Silver')
    assert.equal('progressPercent' in silver, false)
    const markup = renderToStaticMarkup(
      createElement(TierCard, { profile: silver }),
    )
    assert.ok(markup.includes('Наступний рівень: Gold'))
    assert.ok(markup.includes('3 500'))
    assert.ok(markup.includes('12'))
    assert.ok(markup.includes('не показує прогрес'))
    assert.ok(!markup.includes('<progress'))
    assert.ok(!markup.includes('Ще '))
    assert.ok(!markup.includes('Максимальний рівень досягнуто'))
    const gold = mapLoyaltyProfile({
      tier: 'Gold',
      points: 0,
      goldUpgradeAvailable: true,
    })
    const maximum = renderToStaticMarkup(
      createElement(TierCard, { profile: gold }),
    )
    assert.ok(maximum.includes('Максимальний рівень досягнуто'))
    assert.ok(maximum.includes('підвищення квитка до VIP'))
    assert.ok(!maximum.includes('підвищення до Gold'))
    assert.ok(!maximum.includes('<progress'))
  })

  it('keeps missing metrics unknown and only treats explicit Gold as the maximum', () => {
    for (const tier of ['Bronze', 'Silver', 'future-tier', 0]) {
      const profile = mapLoyaltyProfile({ tier, points: 99000 })
      const markup = renderToStaticMarkup(createElement(TierCard, { profile }))
      assert.ok(markup.includes('Немає даних'))
      assert.ok(!markup.includes('Максимальний рівень досягнуто'))
      assert.ok(!markup.includes('<progress'))
      assert.equal(profile.lifetimePoints, undefined)
    }
    assert.equal(
      mapLoyaltyProfile({ tier: 'future-tier', points: 99000 }).tier.id,
      'unknown',
    )
    for (const tier of ['TIER_BRONZE', '1', 1])
      assert.equal(mapLoyaltyProfile({ tier, points: 99000 }).tier.id, 'bronze')
    const zero = mapLoyaltyProfile({
      tier: 'Bronze',
      points: 0,
      yearPoints: 0,
      yearVisits: 0,
    })
    assert.equal(zero.yearPoints, 0)
    assert.equal(zero.yearVisits, 0)
    const malformed = mapLoyaltyProfile({
      tier: 'Silver',
      points: 1,
      yearPoints: NaN,
      yearVisits: -1,
    })
    assert.equal(malformed.yearPoints, undefined)
    assert.equal(malformed.yearVisits, undefined)
    assert.throws(
      () => mapLoyaltyProfile({ tier: 'Bronze', points: NaN }),
      /no valid points balance/,
    )
  })

  it('renders factual membership data, distinct expirations, and history navigation', () => {
    const profile = mapLoyaltyProfile({
      tier: 'Silver',
      points: 12345,
      balanceExpiresAt: '2027-04-10T12:00:00Z',
      tierExpiresAt: '2027-08-20T12:00:00Z',
    })
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(MembershipCard, { profile }),
      ),
    )
    assert.ok(markup.includes('data-tier="silver"'))
    assert.ok(markup.includes('Картка учасника'))
    assert.ok(markup.includes('Доступні бали'))
    assert.ok(markup.includes('12 345'))
    assert.ok(markup.includes('Silver'))
    assert.ok(markup.includes('dateTime="2027-04-10T12:00:00Z"'))
    assert.ok(markup.includes('href="/account/loyalty/history"'))
    assert.ok(!markup.includes('2027-08-20'))
    const status = renderToStaticMarkup(createElement(TierCard, { profile }))
    assert.ok(status.includes('dateTime="2027-08-20T12:00:00Z"'))
    assert.ok(!status.includes('2027-04-10'))
    for (const balanceExpiresAt of [undefined, null, '', 'invalid']) {
      const absent = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(MembershipCard, {
            profile: { ...profile, balanceExpiresAt },
          }),
        ),
      )
      assert.ok(!absent.includes('<time'))
      assert.ok(!absent.includes('Invalid Date'))
    }
  })

  it('does not promote Silver to Gold or promise an unavailable Gold upgrade', () => {
    for (const tier of ['Silver', 'Gold']) {
      const profile = mapLoyaltyProfile({
        tier,
        points: 0,
        goldUpgradeAvailable: tier === 'Silver',
      })
      const markup = renderToStaticMarkup(createElement(TierCard, { profile }))
      assert.ok(!markup.includes('підвищення квитка до VIP'))
    }
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

  it('uses numeric signs even for contradictory, zero, or unknown transaction types', () => {
    const transaction = {
      id: 'signed',
      type: 'EARN_TICKET',
      points: 0,
      balanceAfter: 10,
      orderId: null,
      description: 'Зрозумілий опис',
      createdAt: 'invalid',
    }
    for (const type of [
      'EARN_TICKET',
      'BURN_DISCOUNT',
      'future_refund_bonus',
    ]) {
      for (const points of [0, 12345, -12345]) {
        const item = { ...transaction, type, points }
        assert.equal(
          getTransactionPointsTone(item),
          points > 0 ? 'positive' : points < 0 ? 'negative' : 'neutral',
        )
        assert.equal(
          formatSignedPoints(item),
          points > 0 ? '+12 345' : points < 0 ? '-12 345' : '0',
        )
      }
    }
    const unknown = formatTransactionInfo({
      ...transaction,
      type: 'future_refund_bonus',
    })
    assert.equal(unknown.title, 'Операція з балами')
    assert.equal(unknown.description, transaction.description)
    assert.equal(unknown.date, 'Дата невідома')
    for (const type of ['constructor', '__proto__', 'toString'])
      assert.equal(
        formatTransactionInfo({ ...transaction, type }).title,
        'Операція з балами',
      )
    const markup = renderToStaticMarkup(
      createElement(PointsHistoryTable, {
        transactions: [transaction],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        onLoadMore() {},
      }),
    )
    assert.ok(markup.includes('Без змін'))
    assert.ok(markup.includes('data-tone="neutral"'))
    assert.ok(!markup.includes('datetime="invalid"'))
  })

  it('preserves valid descriptions and strips only known generated wrappers', () => {
    const item = {
      id: 'description',
      type: 'ADMIN_ADDITION',
      points: 10,
      balanceAfter: 10,
      orderId: null,
      description: 'Повернення за зверненням гостя',
      createdAt: '2026-10-20T12:00:00Z',
    }
    assert.equal(formatTransactionInfo(item).description, item.description)
    assert.equal(
      formatTransactionInfo({
        ...item,
        description: '[Admin: fixture-id] Reason: Подяка за відгук',
      }).description,
      'Подяка за відгук',
    )
    const description = 'Уточнення for order з важливими деталями (STANDARD)'
    assert.equal(
      formatTransactionInfo({ ...item, type: 'NEW_TYPE', description })
        .description,
      description,
    )
    const generated =
      'Earned 10 pts for order 00000000-0000-0000-0000-000000000001 (STANDARD)'
    assert.equal(
      formatTransactionInfo({
        ...item,
        type: 'EARN_TICKET',
        description: generated,
      }).description,
      null,
    )
    assert.equal(
      formatTransactionInfo({
        ...item,
        type: 'NEW_TYPE',
        description: generated,
      }).description,
      generated,
    )
  })

  it('renders loading, empty, failure and pending-pagination states separately', () => {
    const props = {
      transactions: [],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      onLoadMore() {},
      onRetry() {},
    }
    const render = (overrides: object) =>
      renderToStaticMarkup(
        createElement(PointsHistoryTable, { ...props, ...overrides }),
      )
    assert.ok(render({ isLoading: true }).includes('Завантажуємо історію'))
    assert.ok(render({}).includes('Історія балів порожня'))
    assert.ok(
      !render({ error: new Error('fixture') }).includes(
        'Історія балів порожня',
      ),
    )
    const item = {
      id: 'pending',
      type: 'ADJUST',
      points: 0,
      balanceAfter: 0,
      orderId: null,
      description: '',
      createdAt: '',
    }
    const pending = render({
      transactions: [item],
      hasMore: true,
      isLoadingMore: true,
    })
    assert.ok(pending.includes('aria-busy="true"'))
    assert.ok(pending.includes('disabled=""'))
    assert.ok(pending.includes('Завантажити ще'))
    const retrying = render({
      transactions: [item],
      error: new Error('fixture'),
      isRetrying: true,
    })
    assert.ok(retrying.includes('aria-busy="true"'))
    assert.ok(retrying.includes('disabled=""'))
  })

  it('links every returned preview to details using the shared masked badge', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AchievementsPreview, {
          data: { totalUnlocked: 0, totalAvailable: 1, items: [achievement] },
        }),
      ),
    )
    assert.ok(
      markup.includes('href="/profile/achievements/synthetic-achievement"'),
    )
    assert.ok(markup.includes('data-size="small"'))
    assert.ok(markup.includes('Секретне досягнення'))
    assert.ok(markup.includes('Публічна підказка'))
    assert.ok(!markup.includes('Прихована назва'))
    assert.ok(!markup.includes('Прихована умова'))
    assert.ok(!markup.includes('125'))
    assert.ok(!markup.includes('<progress'))
    const empty = renderToStaticMarkup(
      createElement(AchievementsPreview, {
        data: { totalUnlocked: 0, totalAvailable: 0, items: [] },
      }),
    )
    assert.ok(empty.includes('Досягнень поки немає'))
    assert.ok(!empty.includes('вже відкрито'))
  })
})
