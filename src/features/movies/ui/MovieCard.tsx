import { CalendarRange, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { movieCopy } from '@/entities/movie/config/movie.copy'
import { getMovieGenres } from '@/entities/movie/lib/movieGenres'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'

interface MovieCardProps {
  movie: Movie
  sessions: Session[]
  technologies: string[]
}

const MovieCard = ({ movie, sessions, technologies }: MovieCardProps) => {
  const displaySessions = sessions
    .filter(s => new Date(s.startTime) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 3)

  const isComingSoon = movie.status === MovieStatus.ComingSoon

  const genresString = Array.isArray(movie.genres)
    ? getMovieGenres(movie.genres).join(', ')
    : movieCopy.card.missingGenre

  return (
    <div className='font-public group relative bg-[var(--bg-card)] rounded-xl overflow-hidden h-full flex flex-col'>
      <div className='relative aspect-[2/3] overflow-hidden bg-zinc-900'>
        <img
          src={movie.posterUrl || movie.backdropUrl}
          alt={movie.title}
          className='w-full h-full object-cover'
          loading='lazy'
        />

        <div className='hover-actions absolute inset-0 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none flex flex-col items-center justify-center backdrop-blur-[2px] gap-3'>
          <Link
            to={`/movies/${movie.id}`}
            className='inline-flex min-h-11 items-center bg-black/60 border border-white/60 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 motion-reduce:transition-none hover:bg-white hover:text-black'
          >
            {movieCopy.card.details}
          </Link>
        </div>

        <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
          <div className='rating-badge'>
            <Star size={12} className='fill-current' aria-hidden='true' />
            {movie.rating}
          </div>
          {isComingSoon && (
            <div className='bg-[var(--color-warning)] text-black text-xs font-semibold px-2 py-1 rounded-md w-fit'>
              {movieCopy.card.comingSoon}
            </div>
          )}
        </div>
      </div>

      <div className='p-4 flex flex-col flex-grow relative z-10'>
        <h3
          className='type-public-title text-[var(--text-main)] mb-1 line-clamp-2'
          title={movie.title}
        >
          {movie.title}
        </h3>
        <p className='text-sm text-[var(--text-muted)] mb-4 line-clamp-1'>
          {genresString}
        </p>

        <div className='mt-auto space-y-3'>
          {!isComingSoon ? (
            <div className='flex flex-wrap gap-2'>
              {displaySessions.length > 0 ? (
                displaySessions.map(st => (
                  <Link
                    key={st.id}
                    to={`/booking/${movie.id}`}
                    state={{ sessionId: st.id }}
                    className='selection-control inline-flex min-h-12 flex-col items-center justify-center rounded-lg px-2.5 py-1.5 text-center flex-grow sm:flex-grow-0 min-w-[64px] tabular-nums'
                  >
                    <span className='block text-sm text-[var(--text-main)] font-semibold leading-none mb-1'>
                      {new Date(st.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {st.priceBase != null && (
                      <span className='block text-xs text-[var(--text-muted)]'>
                        {st.priceBase} ₴
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                <span className='text-xs text-[var(--text-muted)] italic py-1 flex items-center gap-1'>
                  <CalendarRange size={14} /> {movieCopy.card.noSessions}
                </span>
              )}
            </div>
          ) : (
            <div className='text-sm text-[var(--text-muted)] italic'>
              {movieCopy.card.premiereSoon}
            </div>
          )}

          {technologies.length > 0 && (
            <div className='flex flex-wrap gap-x-3 gap-y-1 pt-1'>
              {technologies.map(t => (
                <span
                  key={t}
                  className='text-xs font-medium text-[var(--text-muted)] break-words min-w-0'
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
