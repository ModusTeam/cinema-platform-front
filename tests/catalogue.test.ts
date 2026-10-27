import { describe, expect, test } from 'bun:test'
import {
  catalogueMetadata,
  selectCatalogueMovies,
} from '@/entities/movie/lib/catalogue'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import {
  groupSessionsByMovie,
  selectDailySessions,
} from '@/entities/session/lib/dailySchedule'
import {
  localDateKey,
  parseLocalDate,
  utcDaysForLocalDate,
} from '@/entities/session/lib/sessionDates'
import type { Session } from '@/entities/session/model/session.types'

const movie = (id: string, changes: Partial<Movie> = {}): Movie => ({
  id,
  title: id,
  description: '',
  year: 2024,
  duration: 120,
  rating: 0,
  genres: [],
  cast: [],
  backdropUrl: '',
  status: MovieStatus.Active,
  ...changes,
})

describe('incremental public catalogue', () => {
  test('preserves server order, excludes deleted/archived records and deduplicates overlapping pages', () => {
    const records = [
      movie('z'),
      movie('archived', { status: MovieStatus.Archived }),
      movie('deleted', { deletedAt: '2026-01-01' }),
      movie('soon', { status: MovieStatus.ComingSoon }),
      movie('Z'),
      movie('a'),
    ]
    expect(selectCatalogueMovies(records, 'all').map(m => m.id)).toEqual([
      'z',
      'soon',
      'a',
    ])
    expect(records.length).toBe(6)
  })
  test('status categories do not depend on screenings and do not truncate after eight films', () => {
    const records = [
      ...Array.from({ length: 25 }, (_, i) => movie(String(i))),
      movie('soon', { status: MovieStatus.ComingSoon }),
    ]
    expect(selectCatalogueMovies(records, 'active')).toHaveLength(25)
    expect(selectCatalogueMovies(records, 'soon').map(m => m.id)).toEqual([
      'soon',
    ])
    expect(selectCatalogueMovies([], 'all')).toEqual([])
  })
  test('metadata omits missing values instead of inventing year, duration or genre', () => {
    expect(catalogueMetadata(movie('sparse', { duration: 0 }))).toBe('')
    expect(
      catalogueMetadata(movie('full', { genres: ['Драма'], duration: 97 })),
    ).toBe('Драма / 97 хв')
  })
})

describe('local calendar dates', () => {
  test('accepts real leap dates and rejects invalid URL dates without rollover', () => {
    expect(localDateKey(parseLocalDate('2028-02-29') as Date)).toBe(
      '2028-02-29',
    )
    for (const value of [
      null,
      '',
      '2026-2-1',
      '2026-02-29',
      '2026-13-01',
      '2026-04-31',
      'invalid',
    ])
      expect(parseLocalDate(value)).toBeNull()
  })
  test('day requests cover UTC midnight and local end of day across month and year boundaries', () => {
    for (const date of [
      new Date(2026, 0, 1),
      new Date(2026, 2, 29),
      new Date(2026, 9, 25),
      new Date(2026, 11, 31),
    ]) {
      const days = utcDaysForLocalDate(date)
      expect(days.length >= 1 && days.length <= 2).toBe(true)
      expect(days).toContain(date.toISOString().slice(0, 10))
      const last = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
        0,
        0,
        0,
        -1,
      )
      expect(days).toContain(last.toISOString().slice(0, 10))
    }
  })
})

describe('date-based screenings', () => {
  const start = new Date(2026, 9, 28, 18)
  const session = (id: string, changes: Partial<Session> = {}): Session => ({
    id,
    movieId: 'film',
    movieTitle: 'Фільм',
    hallId: 'hall',
    hallName: 'Зал',
    status: 'Scheduled',
    startTime: start.toISOString(),
    endTime: start.toISOString(),
    ...changes,
  })
  const now = new Date(2026, 9, 28, 12).getTime()
  test('removes expired, cancelled, invalid, other-day and duplicate screenings, then orders by time', () => {
    const records = [
      session('late', { startTime: new Date(2026, 9, 28, 21).toISOString() }),
      session('future'),
      session('FUTURE'),
      session('cancelled', { status: 'Cancelled' }),
      session('past', { startTime: new Date(2026, 9, 28, 9).toISOString() }),
      session('invalid', { startTime: 'bad' }),
      session('tomorrow', {
        startTime: new Date(2026, 9, 29, 18).toISOString(),
      }),
    ]
    expect(
      selectDailySessions(records, '2026-10-28', undefined, now).map(s => s.id),
    ).toEqual(['future', 'late'])
    expect(
      selectDailySessions(records, '2026-10-29', undefined, now).map(s => s.id),
    ).toEqual(['tomorrow'])
  })
  test('movie selection and grouping use case-insensitive IDs without changing the records', () => {
    const records = [
      session('first'),
      session('other', { movieId: 'other' }),
      session('second', { movieId: 'FILM' }),
    ]
    expect(
      selectDailySessions(records, '2026-10-28', 'FILM', now).map(s => s.id),
    ).toEqual(['first', 'second'])
    expect(
      groupSessionsByMovie(records).map(group => group.map(s => s.id)),
    ).toEqual([['first', 'second'], ['other']])
    expect(selectDailySessions(records, '2026-10-28', 'absent', now)).toEqual(
      [],
    )
  })
})
