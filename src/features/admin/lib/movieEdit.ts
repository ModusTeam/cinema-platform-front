import type {
  MovieDto,
  MovieImageReference,
  MovieStatus,
  UpdateMovieRequest,
} from '@/entities/movie/model/movie.types'

export interface MovieEditValues {
  title: string
  description: string
  status: MovieStatus
  trailerUrl?: string
  poster: MovieImageReference | null
  backdrop: MovieImageReference | null
}

export function buildMovieUpdate(
  original: MovieDto,
  values: MovieEditValues,
  touched: { poster: boolean; backdrop: boolean },
): UpdateMovieRequest {
  const changes: UpdateMovieRequest = {}
  if (values.title !== original.title) changes.title = values.title
  if (values.description !== (original.description ?? ''))
    changes.details = { description: values.description }
  if (values.status !== original.status) changes.status = values.status
  const images: NonNullable<UpdateMovieRequest['images']> = {}
  if ((values.trailerUrl ?? null) !== (original.trailerUrl ?? null))
    images.trailerUrl = values.trailerUrl ?? null
  for (const kind of ['poster', 'backdrop'] as const) {
    if (!touched[kind]) continue
    const value = values[kind]
    if (
      (value?.secureUrl ?? null) !== (original[`${kind}Url`] ?? null) ||
      (value?.publicId ?? null) !== (original[`${kind}PublicId`] ?? null)
    )
      images[kind] = value
  }
  if (Object.keys(images).length) changes.images = images
  return changes
}
