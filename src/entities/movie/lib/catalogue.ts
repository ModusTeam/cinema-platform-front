import { type Movie, MovieStatus } from '../model/movie.types'
import { getMovieGenres } from './movieGenres'

export type CatalogueCategory = 'all' | 'active' | 'soon'

export function selectCatalogueMovies(
  movies: Movie[],
  category: CatalogueCategory,
): Movie[] {
  const seen = new Set<string>()
  return movies.filter(movie => {
    const id = movie.id.toLowerCase()
    if (
      seen.has(id) ||
      movie.deletedAt ||
      (movie.status !== MovieStatus.Active &&
        movie.status !== MovieStatus.ComingSoon)
    )
      return false
    seen.add(id)
    return (
      category === 'all' ||
      movie.status ===
        (category === 'soon' ? MovieStatus.ComingSoon : MovieStatus.Active)
    )
  })
}

export function catalogueMetadata(movie: Movie): string {
  return [
    getMovieGenres(movie.genres).filter(Boolean).join(', '),
    movie.duration > 0 ? `${movie.duration} хв` : '',
  ]
    .filter(Boolean)
    .join(' / ')
}
