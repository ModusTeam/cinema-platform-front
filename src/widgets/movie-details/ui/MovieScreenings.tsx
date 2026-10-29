import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { movieCopy } from '@/entities/movie/config/movie.copy'
import { sessionsService } from '@/entities/session/api/sessions.service'
import { getUpcomingSessions } from '@/entities/session/lib/upcomingSessions'
import EmptyState from '@/shared/ui/EmptyState'
import TicketAction from '@/shared/ui/TicketAction'
import UnavailableState from '@/shared/ui/UnavailableState'
import { movieDetailsCopy as copy } from '../config/movieDetails.copy'

const screeningDate = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export default function MovieScreenings({
  movieId,
  onBooking,
}: {
  movieId: string
  onBooking: () => void
}) {
  const {
    data: sessions,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['sessions', 'movie', movieId, 'upcoming'],
    queryFn: async () =>
      getUpcomingSessions(await sessionsService.getByMovieId(movieId), movieId),
    staleTime: 0,
    // Re-evaluate time as well as server data while the visitor reads the film.
    refetchInterval: 30_000,
  })

  return (
    <section aria-labelledby='movie-screenings' className='min-w-0'>
      <h2 id='movie-screenings' className='movie-section-title'>
        {copy.screenings}
      </h2>
      {isPending ? (
        <output className='block py-10 text-[var(--movie-muted)]'>
          {copy.loadingScreenings}
        </output>
      ) : isError ? (
        <UnavailableState
          title={copy.screeningsError}
          description={copy.screeningsErrorDescription}
          onRetry={() => void refetch()}
          className='movie-state'
        />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className='h-12 w-12' />}
          title={copy.noScreenings}
          description={copy.noScreeningsDescription}
          className='movie-state'
        />
      ) : (
        <div className='mt-8'>
          <h3 className='movie-label mb-4'>{copy.nextScreenings}</h3>
          <ul className='divide-y divide-[var(--movie-rule)] border-y border-[var(--movie-rule)]'>
            {sessions.slice(0, 3).map(session => (
              <li
                key={session.id}
                className='flex flex-wrap justify-between gap-x-5 gap-y-1 py-4'
              >
                <time dateTime={session.startTime}>
                  {screeningDate.format(new Date(session.startTime))}
                </time>
                <span className='text-[var(--movie-muted)]'>
                  {session.hallName}
                </span>
              </li>
            ))}
          </ul>
          <TicketAction className='mt-6' onClick={onBooking}>
            {movieCopy.details.buyTicket}
          </TicketAction>
        </div>
      )}
      <Link
        to='/sessions?mode=schedule'
        className='movie-text-link mt-6 inline-flex min-h-11 items-center gap-3 text-sm'
      >
        {copy.schedule}
        <ArrowUpRight size={16} aria-hidden='true' />
      </Link>
    </section>
  )
}
