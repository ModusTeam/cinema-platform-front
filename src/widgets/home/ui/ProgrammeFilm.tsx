import { ArrowRight, Film } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'
import { cn } from '@/shared/lib/utils'
import {
  formatProgrammeDate,
  formatProgrammeTime,
  programmeDay,
} from '../lib/programme'

function FilmArtwork({ movie, lead }: { movie: Movie; lead: boolean }) {
  const source = movie.backdropUrl.includes('placehold.co')
    ? movie.posterUrl
    : movie.backdropUrl || movie.posterUrl
  const [failedSource, setFailedSource] = useState<string>()
  return (
    <div
      className={cn(
        'programme-artwork col-start-1 row-start-1 w-full min-h-0 min-w-0 bg-[var(--signal-artwork)]',
        lead
          ? 'aspect-[16/8] md:aspect-video min-[68.8125rem]:col-start-2 min-[68.8125rem]:min-h-80 min-[68.8125rem]:self-stretch'
          : 'aspect-[3/4] md:aspect-video',
      )}
    >
      {source && failedSource !== source ? (
        <img
          src={source}
          alt={`Кадр або постер фільму «${movie.title}»`}
          className='h-full w-full object-cover'
          loading={lead ? 'eager' : 'lazy'}
          onError={() => setFailedSource(source)}
        />
      ) : (
        <div
          className={cn(
            'flex h-full items-center justify-center text-[var(--text-muted)]',
            lead
              ? 'min-h-45 gap-4 p-5'
              : 'min-h-30 flex-col gap-4 p-3 text-center text-sm md:min-h-45 md:flex-row md:p-5 md:text-left md:text-base',
          )}
        >
          <Film size={40} className='shrink-0' aria-hidden='true' />
          <span>Зображення ще немає</span>
        </div>
      )}
    </div>
  )
}

function Screenings({
  movie,
  sessions,
  hallNames,
  lead,
}: {
  movie: Movie
  sessions: Session[]
  hallNames: Map<string, string>
  lead: boolean
}) {
  return (
    <div
      className={cn(
        'programme-screenings flex min-w-0 flex-wrap gap-3 max-md:w-full',
        lead && 'flex-[2_1_320px] max-md:basis-full',
      )}
    >
      {sessions.length ? (
        sessions.map(session => (
          <Link
            className={cn(
              'programme-screening flex min-h-16 flex-wrap items-center gap-3 border border-current px-4 py-3 hover:bg-[var(--signal-yellow)] hover:text-[var(--signal-ink)]',
              lead
                ? 'flex-[0_1_300px] bg-[var(--signal-chalk)] text-[var(--signal-ink)] max-md:grow'
                : 'flex-[1_1_220px]',
            )}
            key={session.id}
            to={`/booking/${movie.id}`}
            aria-label={`${movie.title}, ${formatProgrammeDate(programmeDay(session.startTime))}, ${formatProgrammeTime(session.startTime)}, ${hallNames.get(session.hallId) || session.hallName}. Перейти до вибору сеансу`}
          >
            <time
              dateTime={session.startTime}
              className='font-programme-display text-[2rem] leading-[1.1] font-bold tabular-nums'
            >
              {formatProgrammeTime(session.startTime)}
            </time>
            <span className='flex-1 wrap-anywhere'>
              {hallNames.get(session.hallId) || session.hallName}
            </span>
            <ArrowRight size={22} aria-hidden='true' />
          </Link>
        ))
      ) : (
        <p>На цю дату сеансів немає.</p>
      )}
    </div>
  )
}

export function ProgrammeFilm({
  movie,
  lead,
  sessions,
  hallNames,
  dateControls,
  showScreenings,
}: {
  movie: Movie
  lead: boolean
  sessions: Session[]
  hallNames: Map<string, string>
  dateControls: ReactNode
  showScreenings: boolean
}) {
  return (
    <article
      className={cn(
        'programme-film items-start border-b border-[var(--signal-divider)] py-6',
        lead
          ? 'programme-lead flex flex-col gap-5 md:gap-0 md:pt-0 min-[68.8125rem]:grid min-[68.8125rem]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
          : 'grid grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] gap-4 md:grid-cols-2 md:gap-6 min-[68.8125rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,.8fr)]',
      )}
    >
      <div
        className={cn(
          'min-w-0',
          lead
            ? 'md:pt-6 md:pr-8 md:pb-8 min-[68.8125rem]:col-start-1'
            : 'col-start-2 row-start-1',
        )}
      >
        <h2
          className={cn(
            'font-programme-display font-extrabold tracking-[-0.025em] wrap-anywhere text-balance uppercase',
            lead
              ? 'text-[clamp(2.375rem,10vw,4rem)] md:text-[clamp(3rem,5.8vw,5.5rem)]'
              : 'text-[1.75rem] md:text-[clamp(1.875rem,3vw,2.75rem)]',
            'leading-[1.06]',
          )}
        >
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h2>
        <p className='mt-3 font-medium'>
          {[
            movie.genres.join(', '),
            movie.duration > 0 ? `${movie.duration} хв` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className='mt-4 max-w-[65ch] leading-[1.55] wrap-anywhere'>
          {movie.description}
        </p>
        <Link
          className='mt-5 inline-flex items-center gap-3 font-semibold text-[var(--signal-blue)]'
          to={`/movies/${movie.id}`}
        >
          Про фільм <ArrowRight size={18} aria-hidden='true' />
        </Link>
      </div>
      <FilmArtwork movie={movie} lead={lead} />
      {showScreenings && (
        <div
          className={
            lead
              ? 'programme-booking-band col-span-full flex w-full min-w-0 flex-wrap items-center gap-6 bg-[var(--signal-ink)] p-4 text-[var(--signal-chalk)] [--focus-ring:var(--signal-chalk)] md:p-6'
              : 'col-span-full min-w-0 min-[68.8125rem]:col-span-1'
          }
        >
          {lead && dateControls}
          <Screenings
            movie={movie}
            sessions={sessions}
            hallNames={hallNames}
            lead={lead}
          />
        </div>
      )}
    </article>
  )
}
