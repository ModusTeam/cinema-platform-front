import {
  type CreateMovieRequest,
  type Movie,
  type MovieDto,
  type MovieImageKind,
  type MovieImageUploadResult,
  MovieStatus,
  type TmdbSearchResult,
  type UpdateMovieRequest,
} from '@/entities/movie/model/movie.types'
import { api } from '@/shared/api/axios'
import type { PaginatedResult } from '@/shared/types/common.types'

export interface MovieRecommendation {
  id: string
  title: string
  posterUrl: string | null
  similarityScore: number
}

export interface MovieImportReceipt {
  message: string
  jobId: string
}

export class MovieUpdateError extends Error {
  readonly completedUpdates: number
  constructor(completedUpdates: number, cause: unknown) {
    const detail = cause instanceof Error ? cause.message : 'Спробуйте ще раз.'
    super(
      completedUpdates > 0
        ? `Частину змін уже збережено. Решту зберегти не вдалося: ${detail}`
        : detail,
      { cause },
    )
    this.completedUpdates = completedUpdates
  }
}

const mapDtoToMovie = (dto: MovieDto & { TrailerUrl?: string }): Movie => ({
  id: dto.id,
  title: dto.title,
  description: dto.description || 'Опис відсутній',
  backdropUrl:
    dto.backdropUrl || 'https://placehold.co/1920x1080?text=No+Image',
  posterUrl: dto.posterUrl ?? undefined,
  genres: dto.genres || [],
  rating: dto.rating,
  year: dto.releaseYear,
  duration: dto.durationMinutes,
  videoUrl: dto.trailerUrl || dto.TrailerUrl,
  cast:
    dto.cast?.map(actor => ({
      name: actor.name,
      role: actor.role ?? undefined,
      photoUrl: actor.photoUrl ?? undefined,
    })) ?? [],
  status: Object.values(MovieStatus).includes(
    dto.status as unknown as MovieStatus,
  )
    ? (dto.status as unknown as MovieStatus)
    : MovieStatus.Active,
  deletedAt: dto.deletedAt,
})

export const moviesService = {
  getDetails: async (id: string, signal?: AbortSignal): Promise<MovieDto> => {
    const { data } = await api.get<MovieDto>(`/movies/${id}`, { signal })
    return data
  },

  create: async (request: CreateMovieRequest): Promise<string> => {
    const { data } = await api.post<string>('/movies', request)
    return data
  },

  uploadImage: async (
    file: File,
    kind: MovieImageKind,
    signal?: AbortSignal,
  ): Promise<MovieImageUploadResult> => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    const { data } = await api.post<MovieImageUploadResult>(
      '/movies/images/upload',
      form,
      { headers: { 'Content-Type': undefined }, signal },
    )
    return data
  },

  getById: async (id: string): Promise<Movie | null> => {
    try {
      const { data } = await api.get<MovieDto>(`/movies/${id}`)
      return mapDtoToMovie(data)
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error)
      throw error
    }
  },

  getAll: async (): Promise<Movie[]> => {
    try {
      const { data } = await api.get<PaginatedResult<MovieDto>>('/movies', {
        params: { pageNumber: 1, pageSize: 100 },
      })
      return data.items.map(mapDtoToMovie)
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      throw error
    }
  },

  getPaginated: async (
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<Movie>> => {
    const { data } = await api.get<PaginatedResult<MovieDto>>('/movies', {
      params: { pageNumber, pageSize, searchTerm },
      signal,
    })

    return {
      ...data,
      items: data.items.map(mapDtoToMovie),
    }
  },

  getDeleted: async (
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResult<Movie>> => {
    const { data } = await api.get<PaginatedResult<MovieDto>>(
      '/movies/deleted',
      {
        params: { pageNumber, pageSize },
      },
    )

    return {
      ...data,
      items: data.items.map(mapDtoToMovie),
    }
  },

  searchTmdb: async (query: string): Promise<TmdbSearchResult[]> => {
    const { data } = await api.get<TmdbSearchResult[]>('/movies/tmdb-search', {
      params: { query },
    })
    return data
  },

  importMovie: async (tmdbId: number): Promise<MovieImportReceipt> => {
    const { data } = await api.post<MovieImportReceipt>('/movies/import', {
      tmdbId,
    })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/movies/${id}`)
  },

  restore: async (id: string): Promise<void> => {
    await api.post(`/movies/${id}/restore`)
  },

  update: async (id: string, changes: UpdateMovieRequest): Promise<void> => {
    let completed = 0
    try {
      if (changes.title !== undefined) {
        await api.patch(`/movies/${id}/title`, { title: changes.title })
        completed++
      }
      if (changes.details && Object.keys(changes.details).length > 0) {
        await api.patch(`/movies/${id}/details`, changes.details)
        completed++
      }
      if (changes.images && Object.keys(changes.images).length > 0) {
        await api.patch(`/movies/${id}/images`, changes.images)
        completed++
      }
      if (changes.status !== undefined) {
        await api.patch(`/movies/${id}/status`, changes.status, {
          headers: { 'Content-Type': 'application/json' },
        })
        completed++
      }
    } catch (error) {
      throw new MovieUpdateError(completed, error)
    }
  },

  getRecommendations: async (
    count: number = 6,
  ): Promise<MovieRecommendation[]> => {
    const { data } = await api.get<MovieRecommendation[]>(
      '/movies/recommendations',
      {
        params: { count },
      },
    )
    return data
  },
}
