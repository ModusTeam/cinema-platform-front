import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import type { Movie } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'
import MovieCard from '@/features/movies/ui/MovieCard'

const movie: Movie = {
  id: 'movie',
  title: 'Довга українська назва фільму',
  description: '',
  backdropUrl: '/poster.jpg',
  genres: ['Драма'],
  rating: 8.8,
  year: 2026,
  duration: 120,
  cast: [],
  status: 2,
}
const session: Session = {
  id: 'session',
  movieId: movie.id,
  movieTitle: movie.title,
  hallId: 'hall',
  hallName: 'Зал 1',
  startTime: '2099-01-01T18:30:00Z',
  endTime: '2099-01-01T20:30:00Z',
  status: 'Scheduled',
}
const renderCard = (priceBase?: number) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(MovieCard, {
        movie,
        sessions: [{ ...session, priceBase }],
        technologies: ['Dolby Atmos'],
      }),
    ),
  )

describe('MovieCard screening price presentation', () => {
  it('shows the supplied screening price and preserves discovery links', () => {
    const markup = renderCard(275)
    assert.ok(markup.includes('275 ₴'))
    assert.ok(markup.includes('href="/booking/movie"'))
    assert.ok(markup.includes('href="/movies/movie"'))
    assert.ok(markup.includes('Dolby Atmos'))
    assert.ok(markup.includes(movie.title))
  })
  it('does not substitute a price for an explicitly free screening', () => {
    assert.ok(renderCard(0).includes('0 ₴'))
  })
  it('keeps a screening navigable without inventing a missing price', () => {
    const markup = renderCard()
    assert.ok(markup.includes('href="/booking/movie"'))
    assert.ok(!markup.includes('₴'))
  })
})
