import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import {
  type Session,
  SessionStatus,
} from '@/entities/session/model/session.types'

// Screening dates use the cinema's Ukrainian timezone, independently of the device.
export const PROGRAMME_TIMEZONE = 'Europe/Kyiv'
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PROGRAMME_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
export const programmeDay = (value: string) =>
  dayFormatter.format(new Date(value))
export const formatProgrammeDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    timeZone: PROGRAMME_TIMEZONE,
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${value}T12:00:00+02:00`))
export const formatProgrammeTime = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    timeZone: PROGRAMME_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export function buildProgramme(
  movies: Movie[],
  sessions: Session[],
  now: number,
) {
  const activeMovies = movies.filter(
    movie => movie.status === MovieStatus.Active,
  )
  const movieIds = new Set(activeMovies.map(movie => movie.id))
  const upcoming = sessions
    .filter(
      session =>
        movieIds.has(session.movieId) &&
        session.status === SessionStatus.Scheduled &&
        new Date(session.startTime).getTime() > now,
    )
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
  return {
    movies: activeMovies,
    sessions: upcoming,
    dates: [
      ...new Set(upcoming.map(session => programmeDay(session.startTime))),
    ],
  }
}
