import { describe, expect, test } from 'bun:test'
import { selectDiscoverMovies } from '@/entities/movie/lib/discoverMovies'
import { getMovieTrailerEmbedUrl } from '@/entities/movie/lib/movieTrailer'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import { getUpcomingSessions } from '@/entities/session/lib/upcomingSessions'
import type { Session } from '@/entities/session/model/session.types'

const movie = (id: string, changes: Partial<Movie> = {}): Movie => ({
  id,
  title: id,
  year: 2024,
  duration: 120,
  rating: 8,
  description: '',
  backdropUrl: '',
  genres: [],
  cast: [],
  status: MovieStatus.Active,
  ...changes,
})

describe('public movie discovery', () => {
  test('excludes the current film, archived/deleted films and duplicate IDs', () => {
    const movies = [
      movie('current'),
      movie('CURRENT'),
      movie('deleted', { deletedAt: '2026-01-01' }),
      movie('archive', { status: MovieStatus.Archived }),
      movie('next'),
      movie('NEXT'),
      movie('soon', { status: MovieStatus.ComingSoon }),
    ]
    expect(
      selectDiscoverMovies(movies, 'current').map(item => item.id),
    ).toEqual(['next', 'soon'])
  })

  test('is deterministic across catalogue order and does not mutate input', () => {
    const movies = [
      movie('b', { title: 'Б', year: 2025 }),
      movie('a', { title: 'А', year: 2025 }),
      movie('old'),
    ]
    const result = selectDiscoverMovies(movies, 'current', 2)
    expect(result.map(item => item.id)).toEqual(['a', 'b'])
    expect(selectDiscoverMovies([...movies].reverse(), 'current', 2)).toEqual(
      result,
    )
    expect(movies.map(item => item.id)).toEqual(['b', 'a', 'old'])
  })

  test('supports empty, current-only and small catalogues', () => {
    expect(selectDiscoverMovies([], 'current')).toEqual([])
    expect(selectDiscoverMovies([movie('current')], 'current')).toEqual([])
    expect(selectDiscoverMovies([movie('only')], 'current')).toHaveLength(1)
    expect(selectDiscoverMovies([movie('only')], 'current', 0)).toEqual([])
  })
})

describe('supported trailers', () => {
  const id = 'Way9Dexny3w'
  test('preserves watch, short, embed and legacy YouTube URL forms', () => {
    for (const url of [
      `https://www.youtube.com/watch?v=${id}&t=3`,
      `https://youtu.be/${id}?si=abc`,
      `https://www.youtube.com/embed/${id}`,
      `https://youtube.com/v/${id}`,
      `https://youtube.com/u/0/${id}`,
      `https://m.youtube.com/shorts/${id}`,
    ])
      expect(getMovieTrailerEmbedUrl(url)).toBe(
        `https://www.youtube.com/embed/${id}`,
      )
  })

  test('omits absent, malformed and untrusted trailer URLs', () => {
    for (const url of [
      null,
      undefined,
      '',
      'invalid',
      'javascript:alert(1)',
      `https://youtube.com.attacker.test/watch?v=${id}`,
      `https://example.test/watch?v=${id}`,
      'https://youtu.be/short',
      'https://youtube.com/watch',
    ])
      expect(getMovieTrailerEmbedUrl(url)).toBeNull()
  })
})

describe('screening availability', () => {
  const now = Date.parse('2026-10-28T09:00:00Z')
  const session = (id: string, changes: Partial<Session> = {}): Session => ({
    id,
    movieId: 'film',
    movieTitle: 'Фільм',
    hallId: 'hall',
    hallName: 'Зал',
    startTime: '2026-10-28T12:00:00Z',
    endTime: '2026-10-28T14:00:00Z',
    status: 'Scheduled',
    ...changes,
  })

  test('only includes future scheduled screenings of this film, in chronological order', () => {
    const sessions = [
      session('later', { startTime: '2026-10-29T12:00:00Z' }),
      session('past', { startTime: '2026-10-27T12:00:00Z' }),
      session('cancelled', { status: 'Cancelled' }),
      session('other', { movieId: 'other' }),
      session('invalid', { startTime: 'invalid' }),
      session('now', { startTime: new Date(now).toISOString() }),
      session('next'),
    ]
    expect(
      getUpcomingSessions(sessions, 'film', now).map(item => item.id),
    ).toEqual(['next', 'later'])
    expect(sessions[0].id).toBe('later')
  })

  test('a previously upcoming session expires as time advances', () => {
    const sessions = [session('next')]
    expect(getUpcomingSessions(sessions, 'film', now)).toHaveLength(1)
    expect(
      getUpcomingSessions(sessions, 'film', Date.parse(sessions[0].startTime)),
    ).toEqual([])
    expect(getUpcomingSessions([], 'film', now)).toEqual([])
  })
})
