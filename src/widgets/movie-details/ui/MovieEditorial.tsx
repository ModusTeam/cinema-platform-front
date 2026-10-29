import { movieCopy } from '@/entities/movie/config/movie.copy'
import { getMovieGenres } from '@/entities/movie/lib/movieGenres'
import type { Movie } from '@/entities/movie/model/movie.types'
import { movieDetailsCopy as copy } from '../config/movieDetails.copy'
import MovieImage from './MovieImage'

export default function MovieEditorial({ movie }: { movie: Movie }) {
  const genres = getMovieGenres(movie.genres)
  const metadata = [
    { label: movieCopy.details.genres, value: genres.join(' / ') },
    {
      label: copy.duration,
      value: movie.duration > 0 ? `${movie.duration} ${copy.minutes}` : null,
    },
    { label: copy.year, value: movie.year > 0 ? movie.year : null },
    { label: copy.rating, value: movie.rating > 0 ? movie.rating : null },
  ].filter(item => item.value)
  const cast = movie.cast?.filter(actor => actor.name.trim()) ?? []

  return (
    <section
      className='movie-paper movie-gutter movie-section'
      aria-labelledby='movie-about'
    >
      <div
        className={
          movie.posterUrl
            ? 'grid items-start gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-[8vw]'
            : 'max-w-4xl'
        }
      >
        <div className='min-w-0'>
          <h2 id='movie-about' className='movie-section-title'>
            {copy.about}
          </h2>
          {movie.description && (
            <p className='movie-description mt-6 whitespace-pre-line'>
              {movie.description}
            </p>
          )}
          {metadata.length > 0 && (
            <dl className='movie-metadata mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-[var(--movie-rule)] py-6 sm:grid-cols-4'>
              {metadata.map(item => (
                <div key={item.label} className='min-w-0'>
                  <dt className='movie-label mb-2'>{item.label}</dt>
                  <dd className='text-base'>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {cast.length > 0 && (
            <div className='mt-8'>
              <h3 className='movie-label mb-5'>{copy.cast}</h3>
              <ul className='divide-y divide-[var(--movie-rule)]'>
                {cast.map((actor, index) => (
                  <li
                    key={`${actor.name}-${index}`}
                    className='grid grid-cols-1 gap-1 py-3 first:pt-0 sm:grid-cols-2 sm:gap-5'
                  >
                    <span>{actor.name}</span>
                    {actor.role && (
                      <span className='text-[var(--movie-muted)]'>
                        {actor.role}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {movie.posterUrl && (
          <figure className='movie-poster mx-auto w-full max-w-[30rem] lg:max-w-none'>
            <MovieImage
              key={movie.posterUrl}
              src={movie.posterUrl}
              alt={`${movie.title} — постер`}
              className='h-auto w-full'
            />
          </figure>
        )}
      </div>
    </section>
  )
}
