import { test } from 'bun:test'
import { strict as assert } from 'node:assert'
import {
  MovieStatus,
  type Movie,
} from '../src/entities/movie/model/movie.types'
import type { Session } from '../src/entities/session/model/session.types'
import {
  buildProgramme,
  programmeDay,
  formatProgrammeTime,
} from '../src/widgets/home/lib/programme'

const movie: Movie = {
  id: 'film',
  title: 'Фільм',
  description: '',
  backdropUrl: '',
  genres: [],
  rating: 0,
  year: 2026,
  duration: 100,
  cast: [],
  status: MovieStatus.Active,
}
const session = (
  id: string,
  startTime: string,
  overrides: Partial<Session> = {},
): Session => ({
  id,
  startTime,
  endTime: startTime,
  movieId: 'film',
  movieTitle: 'Фільм',
  hallId: id,
  hallName: id,
  status: 'Scheduled',
  ...overrides,
})

test('programme keeps all eligible screenings, sorts dates and retains simultaneous halls', () => {
  const result = buildProgramme(
    [movie],
    [
      session('later', '2026-10-28T18:00:00Z'),
      session('a', '2026-10-27T18:00:00Z'),
      session('b', '2026-10-27T18:00:00Z'),
      session('past', '2026-10-25T18:00:00Z'),
      session('cancelled', '2026-10-27T18:00:00Z', { status: 'Cancelled' }),
      session('invalid', 'invalid'),
      session('unknown', '2026-10-27T18:00:00Z', { movieId: 'unknown' }),
    ],
    Date.parse('2026-10-26T00:00:00Z'),
  )
  assert.deepEqual(
    result.sessions.map(item => item.id),
    ['a', 'b', 'later'],
  )
  assert.deepEqual(result.dates, ['2026-10-27', '2026-10-28'])
  assert.equal(
    buildProgramme(
      [{ ...movie, status: MovieStatus.Archived }],
      result.sessions,
      0,
    ).sessions.length,
    0,
  )
})

test('dates and times use Kyiv including UTC midnight and daylight savings boundaries', () => {
  assert.equal(programmeDay('2026-10-26T23:30:00Z'), '2026-10-27')
  assert.equal(formatProgrammeTime('2026-10-26T23:30:00Z'), '01:30')
  assert.equal(formatProgrammeTime('2026-07-01T10:00:00Z'), '13:00')
})

test('programme does not introduce a film or screening display cap', () => {
  const movies = Array.from({ length: 110 }, (_, index) => ({
    ...movie,
    id: String(index),
  }))
  const sessions = movies.map(item =>
    session(item.id, '2026-10-27T18:00:00Z', { movieId: item.id }),
  )
  assert.equal(buildProgramme(movies, sessions, 0).sessions.length, 110)
  assert.equal(buildProgramme(movies, sessions, 0).movies.length, 110)
})
