import type { QueryClient } from '@tanstack/react-query'

export async function invalidateMovieQueries(client: QueryClient) {
  await Promise.all(
    [
      ['admin-movies'],
      ['admin-movies-list'],
      ['movies'],
      ['movie'],
      ['hero-movies'],
      ['home-movies-aggregated'],
    ].map(queryKey => client.invalidateQueries({ queryKey })),
  )
}
