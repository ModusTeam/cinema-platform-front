import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Film } from 'lucide-react'
import { Link } from 'react-router-dom'
import { moviesService } from '@/entities/movie/api/movies.service'
import { selectDiscoverMovies } from '@/entities/movie/lib/discoverMovies'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { movieDetailsCopy as copy } from '../config/movieDetails.copy'
import MovieImage from './MovieImage'

export default function DiscoverMovies({
  currentMovieId,
}: {
  currentMovieId: string
}) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['movies'],
    queryFn: moviesService.getAll,
  })
  const movies = selectDiscoverMovies(data ?? [], currentMovieId)

  return (
    <section
      className='movie-gutter movie-section bg-[var(--bg-main)] text-[var(--text-main)]'
      aria-labelledby='movie-discover'
    >
      <div className='mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-default)] pb-6'>
        <h2 id='movie-discover' className='movie-section-title'>
          {copy.discover}
        </h2>
        <Link
          to='/'
          className='movie-text-link inline-flex min-h-11 items-center gap-4 text-sm'
        >
          {copy.allMovies}
          <ArrowUpRight size={18} aria-hidden='true' />
        </Link>
      </div>
      {isPending ? (
        <output className='block py-16 text-[var(--text-muted)]'>
          {copy.discoverLoading}
        </output>
      ) : isError ? (
        <UnavailableState
          title={copy.discoverError}
          description={copy.discoverErrorDescription}
          onRetry={() => void refetch()}
          className='movie-state'
        />
      ) : movies.length === 0 ? (
        <EmptyState
          icon={<Film className='h-12 w-12' />}
          title={copy.discoverEmpty}
          description={copy.discoverEmptyDescription}
          className='movie-state'
        />
      ) : (
        <ul className='grid gap-x-8 gap-y-12 md:grid-cols-2'>
          {movies.map(movie => (
            <li
              key={movie.id}
              className='min-w-0 border-b border-[var(--border-default)] pb-5'
            >
              <Link
                to={`/movies/${movie.id}`}
                className='movie-discover-link group block'
              >
                <div className='aspect-[16/10] overflow-hidden bg-[var(--bg-card)]'>
                  <MovieImage
                    key={movie.backdropUrl || movie.posterUrl}
                    src={
                      movie.backdropUrl.includes('placehold.co/')
                        ? movie.posterUrl
                        : movie.backdropUrl || movie.posterUrl
                    }
                    alt=''
                    className='movie-discover-image h-full w-full object-cover'
                  />
                </div>
                <div className='mt-5 flex items-start justify-between gap-5'>
                  <h3 className='movie-discover-title'>{movie.title}</h3>
                  {movie.year > 0 && (
                    <span className='shrink-0 pt-1 text-sm text-[var(--text-muted)]'>
                      {movie.year}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
