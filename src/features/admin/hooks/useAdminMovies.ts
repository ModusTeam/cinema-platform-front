import { useState, useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { moviesService } from '@/features/movies/api/movies.service'

interface PaginationState {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const activePageSize = 10
const deletedPageSize = 20

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const useAdminMovies = (shouldFetchDeleted: boolean) => {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [deletedPage, setDeletedPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['admin-movies', page, debouncedSearch],
    queryFn: () =>
      moviesService.getPaginated(page, activePageSize, debouncedSearch),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: deletedData,
    isLoading: isDeletedLoading,
    isPlaceholderData: isDeletedPlaceholderData,
  } = useQuery({
    queryKey: [
      'movies',
      'deleted',
      { pageNumber: deletedPage, pageSize: deletedPageSize },
    ],
    queryFn: () => moviesService.getDeleted(deletedPage, deletedPageSize),
    enabled: shouldFetchDeleted,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: moviesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: moviesService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] })
      queryClient.invalidateQueries({ queryKey: ['movies', 'deleted'] })
    },
  })

  const deleteMovie = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Не вдалося видалити фільм'),
      }
    }
  }

  const restoreMovie = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Не вдалося відновити фільм'),
      }
    }
  }

  const pagination: PaginationState = {
    pageNumber: data?.pageNumber || page,
    pageSize: activePageSize,
    totalPages: data?.totalPages || 0,
    totalCount: data?.totalCount || 0,
    hasPreviousPage: data?.hasPreviousPage || false,
    hasNextPage: data?.hasNextPage || false,
  }

  const deletedPagination: PaginationState = {
    pageNumber: deletedData?.pageNumber || deletedPage,
    pageSize: deletedPageSize,
    totalPages: deletedData?.totalPages || 0,
    totalCount: deletedData?.totalCount || 0,
    hasPreviousPage: deletedData?.hasPreviousPage || false,
    hasNextPage: deletedData?.hasNextPage || false,
  }

  return {
    movies: data?.items || [],
    deletedMovies: deletedData?.items || [],
    isLoading: isLoading || (isPlaceholderData && !data),
    isDeletedLoading:
      isDeletedLoading || (isDeletedPlaceholderData && !deletedData),
    isRestoring: restoreMutation.isPending,
    pagination,
    deletedPagination,
    searchTerm,
    setSearchTerm,
    changePage: setPage,
    changeDeletedPage: setDeletedPage,
    deleteMovie,
    restoreMovie,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] }),
  }
}
