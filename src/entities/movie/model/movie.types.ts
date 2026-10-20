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

export interface ActorDto {
  name: string
  role: string | null
  photoUrl: string | null
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
  description?: string | null
  durationMinutes: number
  rating: number
  releaseYear: number
  posterUrl?: string | null
  backdropUrl?: string | null
  trailerUrl?: string | null
  genres: string[]
  cast?: ActorDto[]
  status: number
  deletedAt?: string | null
}

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  year: string
  posterUrl?: string | null
}
