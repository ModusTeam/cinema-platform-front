import { api } from '@/lib/axios'
import {
  type Movie,
  type MovieDto,
  MovieStatus,
  type PaginatedResult,
  type TmdbSearchResult,
} from '@/features/movies/model/movie.types'

export interface MovieRecommendation {
  id: string
  title: string
  posterUrl: string
  similarityScore: number
}

const mapDtoToMovie = (dto: MovieDto & { TrailerUrl?: string }): Movie => ({
  id: dto.id,
  title: dto.title,
  description: dto.description || 'Опис відсутній',
  backdropUrl:
    dto.backdropUrl || 'https://placehold.co/1920x1080?text=No+Image',
  posterUrl: dto.posterUrl,
  genres: dto.genres || [],
  rating: dto.rating,
  year: dto.releaseYear,
  duration: dto.durationMinutes,
  videoUrl: dto.trailerUrl || dto.TrailerUrl,
  cast: dto.cast || [],
  status: Object.values(MovieStatus).includes(
    dto.status as unknown as MovieStatus,
  )
    ? (dto.status as unknown as MovieStatus)
    : MovieStatus.Active,
  deletedAt: dto.deletedAt,
})

export const moviesService = {
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
  ): Promise<PaginatedResult<Movie>> => {
    const { data } = await api.get<PaginatedResult<MovieDto>>('/movies', {
      params: { pageNumber, pageSize, searchTerm },
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

  importMovie: async (tmdbId: number): Promise<string> => {
    const { data } = await api.post<{ movieId: string }>('/movies/import', {
      tmdbId: tmdbId,
    })
    return data.movieId
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/movies/${id}`)
  },

  restore: async (id: string): Promise<void> => {
    await api.post(`/movies/${id}/restore`)
  },

  update: async (id: string, movieData: Partial<Movie>): Promise<void> => {
    const requests = []

    if (movieData.title !== undefined) {
      requests.push(
        api.patch(`/movies/${id}/title`, {
          title: movieData.title,
        }),
      )
    }

    if (
      movieData.posterUrl !== undefined ||
      movieData.backdropUrl !== undefined ||
      movieData.videoUrl !== undefined
    ) {
      requests.push(
        api.patch(`/movies/${id}/images`, {
          posterUrl: movieData.posterUrl,
          backdropUrl: movieData.backdropUrl,
          trailerUrl: movieData.videoUrl,
        }),
      )
    }

    if (movieData.description !== undefined) {
      requests.push(
        api.patch(`/movies/${id}/details`, {
          description: movieData.description,
          durationMinutes: movieData.duration,
          rating: movieData.rating,
          releaseYear: movieData.year,
        }),
      )
    }

    if (movieData.status !== undefined) {
      requests.push(
        api.patch(`/movies/${id}/status`, movieData.status, {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }

    if (requests.length > 0) {
      await Promise.all(requests)
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
