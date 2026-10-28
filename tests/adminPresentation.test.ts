import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdminPagination } from '@/features/admin/ui/AdminPagination'
import SessionCard from '@/features/admin/ui/SessionCard'

describe('Admin management presentation', () => {
  it('announces an empty result range and disables unavailable pagination', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPagination, {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false,
        onPageChange: () => {},
      }),
    )
    assert.ok(markup.includes('0–0 з 0'))
    assert.equal([...markup.matchAll(/disabled=""/g)].length, 2)
    assert.ok(markup.includes('aria-label="Попередня сторінка"'))
    assert.ok(markup.includes('aria-label="Наступна сторінка"'))
  })

  it('keeps the last page range within the server total', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPagination, {
        pageNumber: 3,
        pageSize: 10,
        totalCount: 24,
        hasPreviousPage: true,
        hasNextPage: false,
        onPageChange: () => {},
      }),
    )
    assert.ok(markup.includes('21–24 з 24'))
    assert.equal([...markup.matchAll(/disabled=""/g)].length, 1)
  })

  it('shows complete session metadata and withholds cancelled-session actions', () => {
    const session = {
      id: 'session',
      startTime: '2030-01-01T18:00:00Z',
      endTime: '2030-01-01T20:00:00Z',
      movieId: 'movie',
      movieTitle: 'Тестовий фільм із довгою назвою',
      hallId: 'hall',
      hallName: 'Великий зал із довгою назвою',
      pricingId: 'pricing',
      pricingName: 'Вечірній тариф',
      status: 'Scheduled',
    }
    const render = (status: string) =>
      renderToStaticMarkup(
        createElement(SessionCard, {
          session: { ...session, status },
          onReschedule: () => {},
          onDelete: () => {},
        }),
      )
    const scheduled = render('Scheduled')
    assert.ok(scheduled.includes(session.movieTitle))
    assert.ok(scheduled.includes(session.hallName))
    assert.ok(scheduled.includes(session.pricingName))
    assert.match(scheduled, /datetime="2030-01-01T18:00:00Z"/i)
    assert.equal([...scheduled.matchAll(/<button/g)].length, 2)
    const cancelled = render('Cancelled')
    assert.ok(cancelled.includes('Скасовано'))
    assert.ok(!cancelled.includes('<button'))
  })
})
