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
  posterPublicId?: string | null
  backdropPublicId?: string | null
  genreIds?: string[] | null
  ageRestriction?: string | null
}

export type MovieImageKind = 'poster' | 'backdrop'

export interface MovieImageReference {
  secureUrl: string
  publicId: string
}

export interface MovieImageUploadResult extends MovieImageReference {
  assetId: string | null
  width: number
  height: number
  format: string
  bytes: number
}

export interface ManualCastMember {
  name: string
  role?: string
}

export interface CreateMovieRequest {
  title: string
  description: string
  durationMinutes: number
  releaseYear: number
  status: MovieStatus
  genreIds?: string[]
  rating?: number
  ageRestriction?: string | null
  poster?: MovieImageReference
  backdrop?: MovieImageReference
  trailerUrl?: string
  cast?: ManualCastMember[]
}

export interface UpdateMovieImagesRequest {
  poster?: MovieImageReference | null
  backdrop?: MovieImageReference | null
  posterUrl?: string | null
  backdropUrl?: string | null
  trailerUrl?: string | null
}

export interface UpdateMovieRequest {
  title?: string
  details?: Partial<
    Pick<
      CreateMovieRequest,
      | 'description'
      | 'durationMinutes'
      | 'releaseYear'
      | 'rating'
      | 'ageRestriction'
      | 'genreIds'
      | 'cast'
    >
  >
  images?: UpdateMovieImagesRequest
  status?: MovieStatus
}

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  year: string
  posterUrl?: string | null
}
