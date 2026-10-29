import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { catalogueMetadata } from '@/entities/movie/lib/catalogue'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import CataloguePoster from '@/features/movies/ui/CataloguePoster'
import { catalogueCopy as copy } from '../config/catalogue.copy'

interface FilmPresentationProps {
  movies: Movie[]
  screeningLink: (id: string) => string
}

export default function FilmGallery({
  movies,
  screeningLink,
}: FilmPresentationProps) {
  return (
    <ul
      className='grid grid-cols-1 gap-x-8 gap-y-14 min-[600px]:grid-cols-2 xl:grid-cols-3 xl:gap-x-12'
      aria-label='Фільми у постерах'
    >
      {movies.map(movie => (
        <li key={movie.id} className='min-w-0'>
          <Link
            to={`/movies/${movie.id}`}
            className='catalogue-film-link group block'
            aria-labelledby={`poster-title-${movie.id}`}
          >
            <CataloguePoster
              key={movie.posterUrl}
              src={movie.posterUrl}
              title={movie.title}
            />
            <h2
              id={`poster-title-${movie.id}`}
              className='catalogue-film-title mt-5 text-[var(--text-main)]'
            >
              {movie.title}
            </h2>
          </Link>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]'>
            {movie.year > 0 && (
              <span className='tabular-nums'>{movie.year}</span>
            )}
            <span>
              {movie.status === MovieStatus.ComingSoon
                ? copy.status.soon
                : copy.status.active}
            </span>
          </div>
          {catalogueMetadata(movie) && (
            <p className='mt-1 text-sm leading-relaxed text-[var(--text-muted)]'>
              {catalogueMetadata(movie)}
            </p>
          )}
          {movie.status === MovieStatus.Active ? (
            <Link
              to={screeningLink(movie.id)}
              className='catalogue-text-link mt-3 inline-flex min-h-11 items-center gap-3 text-sm'
              aria-label={`${copy.findSessions}: ${movie.title}`}
            >
              {copy.findSessions}
              <ArrowUpRight size={16} className='shrink-0' aria-hidden='true' />
            </Link>
          ) : (
            <p className='mt-3 py-3 text-sm text-[var(--text-muted)]'>
              {copy.upcoming}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
