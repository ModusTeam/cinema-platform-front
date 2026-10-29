import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  getOrderTickets,
  isHistoryOrder,
  orderStatusLabels,
  ticketStatusLabels,
} from '@/entities/order/lib/orderPresentation'
import {
  type OrderItem,
  OrderStatus,
  TicketStatus,
} from '@/entities/order/model/order.types'
import {
  ACCOUNT_SECTIONS,
  getAccountSection,
} from '@/features/profile/config/accountNavigation'
import {
  dateOfBirthSchema,
  profileSchema,
} from '@/features/profile/model/profile.schema'
import AccountNavigation from '@/features/profile/ui/AccountNavigation'

const order: OrderItem = {
  id: 'synthetic-order',
  bookingId: 'ORD-TEST',
  totalPrice: 500,
  status: OrderStatus.Paid,
  ticketIds: ['synthetic-a', 'synthetic-b'],
  ticketStatuses: [TicketStatus.Valid, TicketStatus.Used],
  seats: ['Б-7', 'В-12'],
  isPastSession: false,
  sessionDate: '2026-10-29T17:30:00Z',
  movieTitle: 'Тестовий фільм',
  posterUrl: '',
  cinemaHall: 'Тестовий зал',
}

describe('account admission presentation', () => {
  for (const orderStatus of [...Object.values(OrderStatus), 'Unknown']) {
    for (const ticketStatus of [...Object.values(TicketStatus), 'Unknown']) {
      it(`${orderStatus}/${ticketStatus} only exposes paid valid QR`, () => {
        const tickets = getOrderTickets({
          ...order,
          status: orderStatus,
          ticketStatuses: [ticketStatus],
        })
        assert.equal(
          tickets[0].canShowQr,
          orderStatus === 'Paid' && ticketStatus === 'Valid',
        )
        assert.equal(tickets[1].canShowQr, false, 'Missing status fails closed')
      })
    }
  }
  it('preserves seat-to-ID association across mixed ticket states', () => {
    const tickets = getOrderTickets({
      ...order,
      ticketStatuses: [TicketStatus.Refunded, TicketStatus.Valid],
    })
    assert.deepEqual(
      tickets.filter(t => t.canShowQr),
      [
        {
          id: 'synthetic-b',
          seat: 'В-12',
          status: TicketStatus.Valid,
          canShowQr: true,
        },
      ],
    )
    assert.equal(
      getOrderTickets({ ...order, ticketIds: [''] })[0].canShowQr,
      false,
    )
  })
  it('preserves existing historical-valid eligibility; backend owns admission validation', () => {
    assert.equal(
      getOrderTickets({ ...order, isPastSession: true })[0].canShowQr,
      true,
    )
  })
  it('retains active and history classification for every order status', () => {
    for (const status of Object.values(OrderStatus)) {
      assert.equal(
        isHistoryOrder({ ...order, status }),
        ['Cancelled', 'Failed', 'Expired'].includes(status),
      )
      assert.equal(
        isHistoryOrder({ ...order, status, isPastSession: true }),
        true,
      )
      assert.ok(orderStatusLabels[status])
    }
    for (const status of Object.values(TicketStatus))
      assert.ok(ticketStatusLabels[status])
  })
})

describe('account navigation', () => {
  it('has one active section, associated content, and native buttons for every destination', () => {
    for (const section of ACCOUNT_SECTIONS) {
      const markup = renderToStaticMarkup(
        createElement(AccountNavigation, {
          active: section.id,
          onChange: () => {},
        }),
      )
      assert.equal((markup.match(/aria-current="page"/g) ?? []).length, 1)
      assert.equal(
        (markup.match(/aria-controls="account-content"/g) ?? []).length,
        4,
      )
      assert.equal(
        markup.match(
          /<button[^>]*aria-current="page"[^>]*>(.*?)<\/button>/,
        )?.[1],
        section.label,
      )
      assert.equal(getAccountSection(section.id).id, section.id)
    }
    assert.equal(getAccountSection(null).id, 'active-tickets')
    assert.equal(
      getAccountSection('not-an-account-section').id,
      'active-tickets',
    )
  })
})

describe('extracted account validation', () => {
  const valid = {
    firstName: 'Марія',
    lastName: 'Коваленко',
    email: 'synthetic@example.invalid',
  }
  it('preserves optional password changes and required profile fields', () => {
    assert.equal(profileSchema.safeParse(valid).success, true)
    assert.equal(
      profileSchema.safeParse({ ...valid, firstName: '' }).success,
      false,
    )
    assert.equal(
      profileSchema.safeParse({ ...valid, lastName: 'x'.repeat(51) }).success,
      false,
    )
    assert.equal(
      profileSchema.safeParse({ ...valid, email: 'invalid' }).success,
      false,
    )
  })
  it('requires current password, minimum length, and matching confirmation', () => {
    assert.equal(
      profileSchema.safeParse({
        ...valid,
        newPassword: 'synthetic-password',
        confirmNewPassword: 'synthetic-password',
      }).success,
      false,
    )
    assert.equal(
      profileSchema.safeParse({
        ...valid,
        oldPassword: 'synthetic',
        newPassword: 'short',
        confirmNewPassword: 'short',
      }).success,
      false,
    )
    assert.equal(
      profileSchema.safeParse({
        ...valid,
        oldPassword: 'synthetic',
        newPassword: 'synthetic-password',
        confirmNewPassword: 'different',
      }).success,
      false,
    )
    assert.equal(
      profileSchema.safeParse({
        ...valid,
        oldPassword: 'synthetic',
        newPassword: 'synthetic-password',
        confirmNewPassword: 'synthetic-password',
      }).success,
      true,
    )
  })
  it('rejects empty, invalid, future, and pre-1900 birth dates', () => {
    for (const dateOfBirth of ['', 'not-a-date', '2999-01-01', '1899-12-31'])
      assert.equal(dateOfBirthSchema.safeParse({ dateOfBirth }).success, false)
    assert.equal(
      dateOfBirthSchema.safeParse({ dateOfBirth: '1994-08-24' }).success,
      true,
    )
  })
})
