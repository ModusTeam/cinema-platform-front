import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import type { Hall, Seat } from '@/entities/hall/model/hall.types'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import type { SessionSeatAvailability } from '@/entities/session/model/session.types'
import { bookingCopy } from '@/features/booking/config/booking.copy'
import SeatSelector from '@/features/booking/ui/SeatSelector'
import { heroCopy } from '@/features/movies/config/hero.copy'
import { GridLoader } from '@/shared/ui/GridLoader'

// The seeded markup fixtures never fetch. Keep their API module import
// independent of developer .env files and CI deployment configuration.
const { default: HeroSection } = await (async () => {
  const previousApiUrl = process.env.VITE_API_URL
  process.env.VITE_API_URL = '/api'
  try {
    return await import('@/features/movies/ui/HeroSection')
  } finally {
    if (previousApiUrl === undefined) delete process.env.VITE_API_URL
    else process.env.VITE_API_URL = previousApiUrl
  }
})()

const seat: Seat = {
  id: 'seat',
  row: 'A',
  number: 7,
  gridX: 3,
  gridY: 2,
  status: 'Active',
  seatTypeId: 'vip',
  seatTypeName: 'VIP',
}
const availability: SessionSeatAvailability = {
  id: seat.id,
  row: 1,
  number: 7,
  rowLabel: 'A',
  gridX: 3,
  gridY: 2,
  type: 'VIP',
  price: 200,
  isAvailable: true,
  isSold: false,
  isLocked: false,
  isLockedByCurrentUser: false,
}
const hall: Hall = { id: 'hall', name: 'Hall', capacity: 1, seats: [seat] }

const renderSeat = (
  occupancy: SessionSeatAvailability | undefined = availability,
  options: {
    selected?: boolean
    pending?: boolean
    verified?: boolean
    seat?: Seat
  } = {},
) => {
  const markup = renderToStaticMarkup(
    createElement(SeatSelector, {
      hall: { ...hall, seats: [options.seat ?? seat] },
      selectedSeats: options.selected ? [seat] : [],
      pendingSeatIds: new Set(options.pending ? [seat.id] : []),
      onToggleSeat: () => {},
      availabilityVerified: options.verified ?? true,
      occupancy: {
        sessionId: 'session',
        hallId: hall.id,
        movieTitle: 'Movie',
        startTime: '',
        seats: occupancy ? [occupancy] : [],
      },
    }),
  )
  const button = markup.match(/<button\b[^>]*>[\s\S]*?<\/button>/)?.[0]
  assert.ok(button)
  return { markup, button }
}

describe('seat presentation without changing classification', () => {
  it('separates yellow VIP type from a blue, dashed, locked state', () => {
    const available = renderSeat().button
    const locked = renderSeat({
      ...availability,
      isAvailable: false,
      isLocked: true,
    }).button
    assert.ok(available.includes('text-yellow-500'))
    assert.ok(!available.includes('lucide-lock-keyhole'))
    assert.ok(locked.includes('text-sky-400'))
    assert.ok(locked.includes('border-dashed'))
    assert.ok(locked.includes('lucide-lock-keyhole'))
    assert.ok(
      locked.includes('text-yellow-500'),
      'VIP type marker survives locking',
    )
    assert.ok(locked.includes('aria-disabled="true"'))
    assert.ok(locked.includes(`title="${bookingCopy.seats.lockedTitle}"`))
    assert.ok(!locked.includes('text-amber'))
  })

  it('keeps selected seats filled and pressed with a visible boundary', () => {
    const { button } = renderSeat(
      { ...availability, isLocked: true, isLockedByCurrentUser: true },
      { selected: true },
    )
    assert.ok(button.includes('aria-pressed="true"'))
    assert.ok(button.includes('aria-disabled="false"'))
    assert.ok(button.includes('fill="currentColor"'))
    assert.ok(button.includes('border-[var(--color-primary)]'))
    assert.ok(!button.includes('scale-'))
  })

  for (const [name, occupancy, customSeat, icon, description] of [
    [
      'sold',
      { ...availability, isSold: true },
      seat,
      'lucide-x',
      bookingCopy.seats.soldTitle,
    ],
    [
      'maintenance',
      availability,
      { ...seat, status: 'Maintenance' },
      'lucide-wrench',
      bookingCopy.seats.maintenanceTitle,
    ],
    [
      'unknown',
      { ...availability, isAvailable: false },
      seat,
      'lucide-circle-question-mark',
      bookingCopy.seats.unknown,
    ],
  ] as const) {
    it(`keeps ${name} nonselectable, labelled and visually distinct`, () => {
      const { button } = renderSeat(occupancy, { seat: customSeat })
      assert.ok(button.includes('aria-disabled="true"'))
      assert.ok(button.includes(icon))
      assert.ok(button.includes(`title="${description}"`))
      assert.ok(button.includes('VIP.'))
      assert.ok(button.includes('Місце 7'))
    })
  }

  it('preserves pending semantics, type markers and sparse 32px geometry', () => {
    const { markup, button } = renderSeat(availability, {
      pending: true,
      seat: { ...seat, seatTypeName: 'Love Seat' },
    })
    assert.ok(button.includes('aria-busy="true"'))
    assert.ok(button.includes('aria-disabled="true"'))
    assert.ok(button.includes('text-pink-500'))
    assert.ok(button.includes(`title="${bookingCopy.seats.pending}"`))
    assert.ok(button.includes('grid-column:3;grid-row:2'))
    assert.ok(markup.includes('repeat(3, 32px)'))
    assert.ok(markup.includes('repeat(2, 32px)'))
    for (const label of [
      'available',
      'selected',
      'occupied',
      'locked',
      'maintenance',
      'pending',
      'unknown',
    ] as const)
      assert.ok(markup.includes(bookingCopy.seats[label]))
  })

  it('shows unverified availability as unknown while retaining its disabled description', () => {
    const { button } = renderSeat(availability, { verified: false })
    assert.ok(button.includes('aria-disabled="true"'))
    assert.ok(button.includes('lucide-circle-question-mark'))
    assert.ok(button.includes(`title="${bookingCopy.seats.unknown}"`))
    assert.ok(!button.includes('hover:bg-white'))
  })
})

const movie: Movie = {
  id: 'first',
  title: 'Перший фільм',
  description: 'Опис',
  backdropUrl: '/fixture.jpg',
  genres: ['Драма'],
  rating: 8,
  year: 2026,
  duration: 120,
  cast: [],
  status: MovieStatus.Active,
}
const renderHero = (movies: Movie[]) => {
  const client = new QueryClient()
  client.setQueryData(['hero-movies'], movies)
  try {
    return renderToStaticMarkup(
      createElement(
        QueryClientProvider,
        { client },
        createElement(MemoryRouter, null, createElement(HeroSection)),
      ),
    )
  } finally {
    client.clear()
  }
}

describe('hero controls', () => {
  it('renders no carousel or controls for an empty list', () => {
    const markup = renderHero([])
    assert.ok(!markup.includes('<section'))
    assert.ok(!markup.includes('<button'))
  })

  it('keeps one film and its CTAs available without an autoplay control', () => {
    const markup = renderHero([movie])
    assert.ok(markup.includes(movie.title))
    assert.ok(markup.includes('/movies/first'))
    assert.ok(markup.includes('Купити квиток'))
    assert.ok(!markup.includes(heroCopy.pause))
  })

  it('names desktop and mobile selectors and exposes the current film without live announcements', () => {
    const movies = [movie, { ...movie, id: 'second', title: 'Другий фільм' }]
    const markup = renderHero(movies)
    for (const [index, film] of movies.entries()) {
      const label = heroCopy.select(film.title, index + 1, movies.length)
      assert.equal(markup.split(`aria-label="${label}"`).length - 1, 2)
    }
    assert.equal(markup.split('aria-pressed="true"').length - 1, 2)
    assert.ok(markup.includes(heroCopy.pause))
    assert.ok(!markup.includes('aria-live="assertive"'))
  })
})

it('keeps loader labels and independent SVG animation timelines', () => {
  const markup = renderToStaticMarkup(
    createElement(
      'div',
      null,
      createElement(GridLoader),
      createElement(GridLoader),
    ),
  )
  const ids = [...markup.matchAll(/ id="([^"]+)"/g)].map(match => match[1])
  assert.equal(ids.length, 4)
  assert.equal(new Set(ids).size, 4)
  assert.equal(markup.split('aria-label="Завантаження"').length - 1, 2)
})
