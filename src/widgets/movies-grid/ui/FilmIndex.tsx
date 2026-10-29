import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { catalogueMetadata } from '@/entities/movie/lib/catalogue'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import { catalogueCopy as copy } from '../config/catalogue.copy'

export default function FilmIndex({
  movies,
  screeningLink,
}: {
  movies: Movie[]
  screeningLink: (id: string) => string
}) {
  return (
    <div>
      <div
        aria-hidden='true'
        className='catalogue-index-columns hidden border-b border-[var(--catalogue-rule)] pb-4 text-xs text-[var(--text-muted)] lg:grid'
      >
        <span>Рік</span>
        <span>Фільм</span>
        <span>Жанри / тривалість</span>
        <span>Покази</span>
      </div>
      <ul aria-label='Індекс фільмів'>
        {movies.map(movie => (
          <li
            key={movie.id}
            className='catalogue-index-columns grid gap-y-3 border-b border-[var(--catalogue-rule)] py-6 motion-safe:transition-colors hover:bg-[var(--catalogue-image)]'
          >
            <span className='pt-1 text-sm text-[var(--text-muted)] tabular-nums'>
              {movie.year > 0 ? movie.year : null}
            </span>
            <h2 className='min-w-0'>
              <Link
                to={`/movies/${movie.id}`}
                className='catalogue-film-title catalogue-text-link'
              >
                {movie.title}
              </Link>
            </h2>
            <p className='min-w-0 text-sm leading-relaxed text-[var(--text-muted)] lg:pt-2'>
              {catalogueMetadata(movie)}
            </p>
            <div className='min-w-0 text-sm lg:pt-2'>
              <p className='text-[var(--text-muted)]'>
                {movie.status === MovieStatus.ComingSoon
                  ? copy.status.soon
                  : copy.status.active}
              </p>
              {movie.status === MovieStatus.Active ? (
                <Link
                  to={screeningLink(movie.id)}
                  aria-label={`${copy.findSessions}: ${movie.title}`}
                  className='catalogue-text-link inline-flex min-h-11 items-center gap-2'
                >
                  {copy.findSessions}
                  <ArrowUpRight
                    size={16}
                    className='shrink-0'
                    aria-hidden='true'
                  />
                </Link>
              ) : (
                <p className='mt-2 text-[var(--text-muted)]'>{copy.upcoming}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
