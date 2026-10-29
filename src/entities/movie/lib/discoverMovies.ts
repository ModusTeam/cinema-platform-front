import { type Movie, MovieStatus } from '../model/movie.types'

// Public catalogue selection, not personalized or similarity recommendations.
export function selectDiscoverMovies(
  movies: Movie[],
  currentMovieId: string,
  limit = 4,
): Movie[] {
  const excludedIds = new Set([currentMovieId.toLowerCase()])

  return [...movies]
    .filter(
      movie =>
        !movie.deletedAt &&
        (movie.status === MovieStatus.Active ||
          movie.status === MovieStatus.ComingSoon),
    )
    .sort(
      (a, b) =>
        b.year - a.year ||
        a.title.localeCompare(b.title, 'uk') ||
        a.id.localeCompare(b.id),
    )
    .filter(movie => {
      const id = movie.id.toLowerCase()
      if (excludedIds.has(id)) return false
      excludedIds.add(id)
      return true
    })
    .slice(0, Math.max(0, limit))
}
