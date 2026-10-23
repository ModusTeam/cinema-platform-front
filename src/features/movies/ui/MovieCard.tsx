import { CalendarRange, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { movieCopy } from '@/entities/movie/config/movie.copy'
import { getMovieGenres } from '@/entities/movie/lib/movieGenres'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import { DEFAULT_SESSION_PRICE } from '@/entities/session/config/session.constants'
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
    <div className='group relative bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-white/5 transition-colors duration-150 hover:border-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)]/30 h-full flex flex-col'>
      <div className='relative aspect-[2/3] overflow-hidden bg-zinc-900'>
        <img
          src={movie.posterUrl || movie.backdropUrl}
          alt={movie.title}
          className='w-full h-full object-cover'
          loading='lazy'
        />

        <div className='hover-actions absolute inset-0 bg-black/60 transition-opacity duration-150 flex flex-col items-center justify-center backdrop-blur-[2px] gap-3'>
          <Link
            to={`/movies/${movie.id}`}
            className='bg-white/10 border border-white/20 text-white font-bold py-2.5 px-6 rounded-full transition-colors duration-150 hover:bg-white hover:text-black'
          >
            {movieCopy.card.details}
          </Link>
        </div>

        <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
          <div className='bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg w-fit'>
            <Star
              size={12}
              className='text-[var(--color-primary)] fill-[var(--color-primary)]'
            />
            {movie.rating}
          </div>
          {isComingSoon && (
            <div className='bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg w-fit'>
              {movieCopy.card.comingSoon}
            </div>
          )}
        </div>
      </div>

      <div className='p-4 flex flex-col flex-grow relative z-10'>
        <h3 className='text-lg font-bold text-white mb-1 leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2'>
          {movie.title}
        </h3>
        <p className='text-xs font-medium text-[var(--text-muted)] mb-4 line-clamp-1'>
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
                    className='bg-white/5 hover:bg-[var(--color-primary)] hover:text-white border border-white/10 hover:border-[var(--color-primary)] rounded-lg px-2.5 py-1.5 text-center transition-colors duration-150 flex-grow sm:flex-grow-0 min-w-[55px] group/btn'
                  >
                    <span className='block text-sm font-bold leading-none mb-0.5'>
                      {new Date(st.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className='block text-[9px] opacity-60 font-medium group-hover/btn:opacity-100'>
                      {st.priceBase || DEFAULT_SESSION_PRICE} ₴
                    </span>
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
            <div className='flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-white/5'>
              {technologies.map(t => (
                <span
                  key={t}
                  className='text-[9px] font-bold uppercase border border-white/10 text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-white/5 whitespace-nowrap'
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
