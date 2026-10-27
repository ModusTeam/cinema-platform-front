import { useInfiniteQuery } from '@tanstack/react-query'
import { moviesService } from '@/entities/movie/api/movies.service'
import {
  type CatalogueCategory,
  selectCatalogueMovies,
} from '@/entities/movie/lib/catalogue'

const PAGE_SIZE = 12

export function useCatalogue(category: CatalogueCategory) {
  const query = useInfiniteQuery({
    queryKey: ['movies', 'catalogue', { pageSize: PAGE_SIZE }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      moviesService.getPaginated(pageParam, PAGE_SIZE, undefined, signal),
    getNextPageParam: page =>
      page.pageNumber < page.totalPages ? page.pageNumber + 1 : undefined,
  })
  const records = query.data?.pages.flatMap(page => page.items) ?? []
  return {
    ...query,
    movies: selectCatalogueMovies(records, category),
    loadedCount: records.length,
    totalCount: query.data?.pages[0]?.totalCount ?? 0,
  }
}
