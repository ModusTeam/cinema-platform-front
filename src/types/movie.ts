export const MovieStatus = {
  ComingSoon: 1,
  Active: 2,
  Archived: 3,
} as const

export type MovieStatus = (typeof MovieStatus)[keyof typeof MovieStatus]

export interface Actor {
  name: string
  role?: string
  photoUrl?: string
}

export interface Movie {
  id: string
  title: string
  description: string
  backdropUrl: string
  posterUrl?: string
  genres: string[]
  rating: number
  year: number
  duration: number
  videoUrl?: string | null
  cast: Actor[]
  status: MovieStatus
  deletedAt?: string | null
}

export interface MovieDto {
  id: string
  title: string
  description?: string
  durationMinutes: number
  rating: number
  releaseYear: number
  posterUrl?: string
  backdropUrl?: string
  trailerUrl?: string
  genres: string[]
  cast: Actor[]
  status: number
  deletedAt?: string | null
}

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  year: string
  posterUrl?: string
}

export interface PaginatedResult<T> {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
