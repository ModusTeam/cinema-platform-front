import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { moviesService } from '../services/moviesService'
import MovieDetails from '../features/movies/components/MovieDetails'
import NotFoundPage from './NotFoundPage'
import { GridLoader } from '../common/components/GridLoader'

const MoviePage = () => {
  const { id } = useParams<{ id: string }>()

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-[var(--bg-main)] text-white'>
        <GridLoader className='h-10 w-10 animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (isError || !movie) {
    return <NotFoundPage />
  }

  return <MovieDetails movie={movie} />
}

export default MoviePage
