import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sessionsService } from '@/entities/session/api/sessions.service'
import {
  groupSessionsByMovie,
  selectDailySessions,
} from '@/entities/session/lib/dailySchedule'
import {
  localDateKey,
  parseLocalDate,
} from '@/entities/session/lib/sessionDates'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { catalogueCopy as copy } from '../config/catalogue.copy'
import CatalogueLoading from './CatalogueLoading'

interface DailyScheduleProps {
  date: string
  movieId?: string
  onDateChange: (date: string) => void
  onClearMovie: () => void
  onBrowse: () => void
}

export default function DailySchedule({
  date,
  movieId,
  onDateChange,
  onClearMovie,
  onBrowse,
}: DailyScheduleProps) {
  const selectedDate = parseLocalDate(date) ?? new Date()
  const today = new Date()
  const dates = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
  )
  const query = useQuery({
    queryKey: ['sessions', 'by-local-date', date],
    queryFn: async ({ signal }) =>
      selectDailySessions(
        await sessionsService.getForLocalDate(selectedDate, signal),
        date,
      ),
    staleTime: 0,
    refetchInterval: 30_000,
  })
  const groups = groupSessionsByMovie(
    selectDailySessions(query.data ?? [], date, movieId),
  )

  return (
    <section aria-label='Розклад за датою'>
      <div className='mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] lg:items-end'>
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-7'>
          {dates.map(day => {
            const key = localDateKey(day)
            return (
              <button
                key={key}
                type='button'
                aria-pressed={date === key}
                aria-label={day.toLocaleDateString('uk-UA', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                onClick={() => onDateChange(key)}
                className='catalogue-day min-w-0 px-2 py-3 text-center'
              >
                <span className='block text-xs'>
                  {key === localDateKey(today)
                    ? 'Сьогодні'
                    : day.toLocaleDateString('uk-UA', { weekday: 'short' })}
                </span>
                <span className='my-1 block text-2xl leading-tight tabular-nums'>
                  {day.getDate()}
                </span>
                <span className='block text-xs'>
                  {day.toLocaleDateString('uk-UA', { month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>
        <label className='block min-w-0 text-sm' htmlFor='schedule-date'>
          Інша дата
          <input
            id='schedule-date'
            aria-label='Інша дата'
            type='date'
            className='catalogue-date mt-2 block min-h-12 w-full min-w-0 border border-[var(--text-muted)] bg-transparent p-2 text-base'
            value={date}
            onChange={event => {
              if (parseLocalDate(event.target.value))
                onDateChange(event.target.value)
            }}
          />
        </label>
      </div>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--catalogue-rule)] pb-5'>
        <h2 className='text-lg font-medium'>
          {selectedDate.toLocaleDateString('uk-UA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        {movieId && (
          <div className='flex flex-wrap items-center gap-x-4 text-sm'>
            <span className='text-[var(--text-muted)]'>
              {copy.selectedFilm}
            </span>
            <button
              type='button'
              className='catalogue-text-link min-h-11'
              onClick={onClearMovie}
            >
              {copy.allSessions}
            </button>
          </div>
        )}
      </div>
      {query.isPending ? (
        <CatalogueLoading label='Завантажуємо сеанси' />
      ) : query.isError ? (
        <UnavailableState
          title={copy.scheduleError}
          onRetry={() => void query.refetch()}
          className='catalogue-state'
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className='h-12 w-12' />}
          title={movieId ? copy.noFilmSessions : copy.noSessions}
          description={copy.noSessionsDescription}
          actionLabel='До фільмів'
          onAction={onBrowse}
          className='catalogue-state'
        />
      ) : (
        <ul aria-label='Доступні покази'>
          {groups.map(sessions => {
            const first = sessions[0]
            return (
              <li
                key={first.movieId}
                className='grid gap-6 border-b border-[var(--catalogue-rule)] py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12'
              >
                <h3 className='min-w-0'>
                  <Link
                    to={`/movies/${first.movieId}`}
                    className='catalogue-film-title catalogue-text-link'
                  >
                    {first.movieTitle}
                  </Link>
                </h3>
                <ul className='grid min-w-0 gap-3 sm:grid-cols-2'>
                  {sessions.map(session => (
                    <li key={session.id} className='min-w-0'>
                      <Link
                        to={`/booking/${session.movieId}`}
                        state={{ sessionId: session.id }}
                        className='catalogue-session flex min-h-16 items-center justify-between gap-4 border border-[var(--text-muted)] px-4 py-3'
                        aria-label={`${session.movieTitle}, ${new Date(session.startTime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}, ${session.hallName}. Обрати місця`}
                      >
                        <div className='min-w-0'>
                          <time
                            dateTime={session.startTime}
                            className='text-xl font-medium tabular-nums'
                          >
                            {new Date(session.startTime).toLocaleTimeString(
                              'uk-UA',
                              { hour: '2-digit', minute: '2-digit' },
                            )}
                          </time>
                          <span className='mt-1 block text-xs text-[var(--text-muted)]'>
                            {session.hallName}
                          </span>
                        </div>
                        <span className='text-xs'>Обрати місця</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
