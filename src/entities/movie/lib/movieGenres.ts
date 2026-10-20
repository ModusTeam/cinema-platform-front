export const getMovieGenres = (genres: unknown): string[] => {
  if (!Array.isArray(genres)) return []

  return genres.map(genre => {
    if (typeof genre === 'string') return genre
    if (
      typeof genre === 'object' &&
      genre !== null &&
      'name' in genre &&
      typeof genre.name === 'string'
    ) {
      return genre.name
    }
    return ''
  })
}
