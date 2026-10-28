import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Session } from '@/entities/session/model/session.types'
import { getBookingReturn } from '@/features/auth/lib/bookingReturn'
import type { CheckoutPreviewResponse } from '@/features/booking/api/booking.service'
import { bookingCopy } from '@/features/booking/config/booking.copy'
import {
  matchesCheckoutPreview,
  sameCheckoutRequest,
} from '@/features/booking/lib/checkoutPreview'
import { getBookingOrderResult } from '@/features/booking/lib/orderResult'
import {
  readSessionHandoff,
  validateSessionHandoff,
} from '@/features/booking/lib/sessionHandoff'
import SessionSelector from '@/features/booking/ui/SessionSelector'

const now = Date.parse('2026-10-28T12:00:00Z')
const session: Session = {
  id: 'session-a',
  movieId: 'movie-a',
  movieTitle: 'Кіно',
  startTime: '2026-10-29T18:00:00Z',
  endTime: '2026-10-29T20:00:00Z',
  status: 'Scheduled',
  hallId: 'hall-a',
  hallName: 'Великий зал',
}
const request = {
  sessionId: session.id,
  seatIds: ['seat-a'],
  useLoyaltyPoints: false,
  applyGoldUpgrade: false,
}
const preview: CheckoutPreviewResponse = {
  currency: 'UAH',
  canCheckout: true,
  originalAmount: 230,
  amountAfterGoldUpgrade: 230,
  finalAmountToPay: 230,
  totalDiscountAmount: 0,
  goldUpgrade: {
    requested: false,
    canApply: true,
    applied: false,
    discountAmount: 0,
    seatId: null,
    priceBefore: null,
    priceAfter: null,
    reasonCode: null,
    reason: null,
  },
  loyaltyPoints: {
    requested: false,
    canApply: true,
    applied: false,
    pointsToDeduct: 0,
    discountAmount: 0,
    amountToPay: 230,
    reasonCode: null,
    reason: null,
  },
  tickets: [
    {
      seatId: 'seat-a',
      seatType: 'Standard',
      originalPrice: 230,
      finalPriceAfterGoldUpgrade: 230,
      goldDiscountAmount: 0,
      isGoldUpgraded: false,
    },
  ],
  warnings: [],
}

describe('validated session handoff', () => {
  it('accepts a future screening for this movie with normalized IDs', () => {
    assert.equal(readSessionHandoff({ sessionId: 'SESSION-A' }), 'session-a')
    assert.equal(
      validateSessionHandoff(session, 'SESSION-A', 'MOVIE-A', now),
      true,
    )
  })
  it('rejects missing, malformed, mismatched, cancelled and expired screenings', () => {
    for (const value of [
      null,
      {},
      { sessionId: 1 },
      { sessionId: '../session' },
      { sessionId: '' },
    ])
      assert.equal(readSessionHandoff(value), undefined)
    assert.equal(
      validateSessionHandoff(session, 'missing', 'movie-a', now),
      false,
    )
    assert.equal(
      validateSessionHandoff(session, 'session-a', 'movie-b', now),
      false,
    )
    for (const startTime of [
      '2026-10-28T12:00:00Z',
      '2026-10-27T18:00:00Z',
      'invalid',
    ])
      assert.equal(
        validateSessionHandoff(
          { ...session, startTime },
          'session-a',
          'movie-a',
          now,
        ),
        false,
      )
    assert.equal(
      validateSessionHandoff(
        { ...session, status: 'Cancelled' },
        'session-a',
        'movie-a',
        now,
      ),
      false,
    )
  })
  it('returns only to an internal booking route after login', () => {
    assert.deepEqual(
      getBookingReturn({ from: '/booking/movie-a', sessionId: 'session-a' }),
      { pathname: '/booking/movie-a', state: { sessionId: 'session-a' } },
    )
    assert.deepEqual(getBookingReturn({ from: '/booking/movie-a' }), {
      pathname: '/booking/movie-a',
      state: null,
    })
    for (const from of [
      'https://example.com',
      '//example.com',
      '/\\example.com',
      '/booking/%2fexample.com',
      '/booking/a/../b',
      '/booking/a?redirect=https://example.com',
      '/profile',
      'javascript:alert(1)',
    ])
      assert.equal(getBookingReturn({ from }), undefined)
  })
})

describe('checkout preview freshness', () => {
  it('invalidates previous parameters immediately for seats, sessions and options', () => {
    assert.equal(sameCheckoutRequest(request, { ...request }), true)
    for (const next of [
      { ...request, sessionId: 'session-b' },
      { ...request, seatIds: ['seat-b'] },
      { ...request, seatIds: [] },
      { ...request, useLoyaltyPoints: true },
      { ...request, applyGoldUpgrade: true },
    ])
      assert.equal(sameCheckoutRequest(request, next), false)
  })
  it('requires a matching server preview and a finite nonnegative total', () => {
    assert.equal(matchesCheckoutPreview(preview, request), true)
    assert.equal(matchesCheckoutPreview(undefined, request), false)
    assert.equal(
      matchesCheckoutPreview(preview, { ...request, seatIds: ['seat-b'] }),
      false,
    )
    assert.equal(
      matchesCheckoutPreview(preview, { ...request, applyGoldUpgrade: true }),
      false,
    )
    assert.equal(
      matchesCheckoutPreview(preview, { ...request, useLoyaltyPoints: true }),
      false,
    )
    for (const finalAmountToPay of [NaN, Infinity, -1])
      assert.equal(
        matchesCheckoutPreview({ ...preview, finalAmountToPay }, request),
        false,
      )
    assert.equal(
      matchesCheckoutPreview({ ...preview, finalAmountToPay: 0 }, request),
      true,
    )
  })
})

describe('booking presentation truth', () => {
  it('does not invent a price when absent and preserves a server zero price', () => {
    const markup = renderToStaticMarkup(
      createElement(SessionSelector, {
        sessions: [session],
        selectedSession: null,
        onSelect: () => {},
      }),
    )
    assert.ok(markup.includes(bookingCopy.priceOnCheckout))
    assert.ok(markup.includes(session.hallName))
    const zero = renderToStaticMarkup(
      createElement(SessionSelector, {
        sessions: [{ ...session, priceBase: 0 }],
        selectedSession: session,
        onSelect: () => {},
      }),
    )
    assert.ok(zero.includes('0 ₴'))
    assert.ok(zero.includes('aria-pressed="true"'))
  })
  it('confirms payment only for the explicit Paid state', () => {
    assert.equal(getBookingOrderResult('Paid').title, bookingCopy.result.paid)
    for (const status of [
      undefined,
      'Pending',
      'PaymentProcessing',
      'PaymentOutcomeUnknown',
      'Failed',
      'Cancelled',
      'Expired',
      'Unexpected',
    ])
      assert.notEqual(
        getBookingOrderResult(status).title,
        bookingCopy.result.paid,
      )
    assert.equal(
      getBookingOrderResult('PaymentProcessing').title,
      bookingCopy.result.processing,
    )
    assert.equal(
      getBookingOrderResult('PaymentOutcomeUnknown').title,
      bookingCopy.result.unknown,
    )
  })
})
