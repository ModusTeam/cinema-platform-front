import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { type AxiosAdapter, AxiosError } from 'axios'
import {
  MovieUpdateError,
  moviesService,
} from '@/entities/movie/api/movies.service'
import type {
  MovieDto,
  MovieImageUploadResult,
} from '@/entities/movie/model/movie.types'
import {
  buildMovieUpdate,
  type MovieEditValues,
} from '@/features/admin/lib/movieEdit'
import {
  maxMovieImageBytes,
  validateMovieImage,
} from '@/features/admin/lib/movieImageUpload'
import {
  maximumReleaseYear,
  movieFormDefaults,
  movieFormSchema,
  toCreateMovieRequest,
} from '@/features/admin/model/movieForm.schema'
import { invalidateMovieQueries } from '@/features/admin/model/movieQueries'
import { api } from '@/shared/api/axios'
import { tokenStorage } from '@/shared/api/tokenStorage'

const genreId = '11111111-1111-1111-1111-111111111111'
const movieId = '22222222-2222-2222-2222-222222222222'
const validInput = () => ({
  ...movieFormDefaults,
  title: '  Власний фільм  ',
  description: '  Опис  ',
  durationMinutes: 95,
  releaseYear: 1994,
})
const image: MovieImageUploadResult = {
  secureUrl:
    'https://res.cloudinary.com/test/image/upload/v1/posters/exact.webp',
  publicId: 'posters/exact',
  assetId: 'asset',
  width: 1000,
  height: 1500,
  format: 'webp',
  bytes: 123456,
}
const original: MovieDto = {
  id: movieId,
  title: 'Фільм',
  description: 'Опис',
  durationMinutes: 95,
  releaseYear: 1994,
  rating: 8.25,
  genres: ['Драма'],
  genreIds: [genreId],
  status: 2,
  posterUrl: image.secureUrl,
  posterPublicId: image.publicId,
  backdropUrl: null,
  backdropPublicId: null,
  trailerUrl: null,
  ageRestriction: '12+',
  cast: [{ name: 'Actor', role: 'Lead', photoUrl: null }],
}
const editValues = (): MovieEditValues => ({
  title: original.title,
  description: original.description ?? '',
  status: 2,
  trailerUrl: undefined,
  poster: { secureUrl: image.secureUrl, publicId: image.publicId },
  backdrop: null,
})

const initialAdapter = api.defaults.adapter
let tokenSpy: ReturnType<typeof spyOn> | undefined
afterEach(() => {
  api.defaults.adapter = initialAdapter
  tokenSpy?.mockRestore()
})
function mockApiAdapter(adapter: AxiosAdapter) {
  tokenSpy = spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null)
  api.defaults.adapter = adapter
}

describe('manual movie validation and serialization', () => {
  test('trims required strings and omits empty optional fields', () => {
    expect(toCreateMovieRequest(movieFormSchema.parse(validInput()))).toEqual({
      title: 'Власний фільм',
      description: 'Опис',
      durationMinutes: 95,
      releaseYear: 1994,
      status: 1,
    })
  })
  test('serializes existing genre IDs, trimmed cast and exact managed references', () => {
    const values = movieFormSchema.parse({
      ...validInput(),
      genreIds: [genreId],
      cast: [
        { name: ' Actor ', role: ' Lead ' },
        { name: 'Other', role: ' ' },
      ],
      rating: 0,
      ageRestriction: '12+',
      poster: image,
      backdrop: { ...image, publicId: 'backdrops/exact' },
      trailerUrl: ' https://youtu.be/abc ',
    })
    const payload = JSON.parse(JSON.stringify(toCreateMovieRequest(values)))
    expect(payload.genreIds).toEqual([genreId])
    expect(payload.cast).toEqual([
      { name: 'Actor', role: 'Lead' },
      { name: 'Other' },
    ])
    expect(payload.poster).toEqual({
      secureUrl: image.secureUrl,
      publicId: image.publicId,
    })
    expect(payload.backdrop.publicId).toBe('backdrops/exact')
    expect(payload.rating).toBe(0)
    expect(payload.trailerUrl).toBe('https://youtu.be/abc')
  })
  test('rejects invalid numbers, rating precision, status, URLs and duplicate collections', () => {
    for (const change of [
      { title: ' ' },
      { description: ' ' },
      { durationMinutes: 0 },
      { durationMinutes: 601 },
      { durationMinutes: 2.5 },
      { releaseYear: 1887 },
      { releaseYear: maximumReleaseYear() + 1 },
      { rating: 8.251 },
      { rating: -1 },
      { rating: 10.01 },
      { status: 0 },
      { ageRestriction: '13+' },
      { trailerUrl: 'http://example.com' },
      { trailerUrl: 'https://user:pass@example.com' },
      { genreIds: [genreId, genreId] },
      { genreIds: ['00000000-0000-0000-0000-000000000000'] },
      {
        cast: [
          { name: ' A ', role: 'B' },
          { name: 'a', role: ' b ' },
        ],
      },
      { cast: [{ name: '', role: 'Lead' }] },
      {
        cast: Array.from({ length: 51 }, (_, n) => ({
          name: `Actor ${n}`,
          role: '',
        })),
      },
    ]) {
      expect(
        movieFormSchema.safeParse({ ...validInput(), ...change }).success,
      ).toBe(false)
    }
    expect(
      movieFormSchema.safeParse({
        ...validInput(),
        durationMinutes: 1,
        releaseYear: 1888,
        rating: 8.25,
      }).success,
    ).toBe(true)
  })
})

describe('movie API integration through the shared client', () => {
  test('POST creation parses the HTTP 200 JSON GUID string', async () => {
    const payload = toCreateMovieRequest(movieFormSchema.parse(validInput()))
    mockApiAdapter(async config => {
      expect(config.url).toBe('/movies')
      expect(config.method).toBe('post')
      expect(JSON.parse(config.data)).toEqual(payload)
      return {
        data: JSON.stringify(movieId),
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      }
    })
    expect(await moviesService.create(payload)).toBe(movieId)
  })
  test('poster and backdrop uploads send FormData without the JSON content type', async () => {
    const file = new File(['image'], 'poster.webp', { type: 'image/webp' })
    for (const kind of ['poster', 'backdrop'] as const) {
      mockApiAdapter(async config => {
        expect(config.url).toBe('/movies/images/upload')
        expect(config.data).toBeInstanceOf(FormData)
        expect(config.data.get('kind')).toBe(kind)
        expect(config.data.get('file').name).toBe('poster.webp')
        expect(config.headers.getContentType()).not.toBe('application/json')
        return {
          data: image,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      })
      expect(await moviesService.uploadImage(file, kind)).toEqual(image)
      tokenSpy?.mockRestore()
    }
  })
  test('upload failure statuses retain normalized server feedback', async () => {
    const refreshSpy = spyOn(tokenStorage, 'getRefreshToken').mockReturnValue(
      null,
    )
    try {
      for (const status of [400, 401, 403, 413, 415, 502, 503, 504]) {
        mockApiAdapter(async config => {
          throw new AxiosError(
            'Request failed',
            'ERR_BAD_RESPONSE',
            config,
            undefined,
            {
              data: { detail: `Upload error ${status}` },
              status,
              statusText: 'Error',
              headers: {},
              config,
            },
          )
        })
        await expect(
          moviesService.uploadImage(
            new File(['image'], 'p.png', { type: 'image/png' }),
            'poster',
          ),
        ).rejects.toThrow(`Upload error ${status}`)
        tokenSpy?.mockRestore()
      }
    } finally {
      refreshSpy.mockRestore()
    }
  })
  test('creation exposes server validation details without claiming success', async () => {
    mockApiAdapter(async config => {
      throw new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        {
          data: { code: 'Movie.Validation', detail: 'Title is required' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config,
        },
      )
    })
    await expect(
      moviesService.create(
        toCreateMovieRequest(movieFormSchema.parse(validInput())),
      ),
    ).rejects.toThrow('Title is required')
  })
  test('TMDB retains search parameters and the accepted import receipt', async () => {
    mockApiAdapter(async config => {
      if (config.method === 'get') {
        expect(config.url).toBe('/movies/tmdb-search')
        expect(config.params).toEqual({ query: 'Dune' })
        return { data: [], status: 200, statusText: 'OK', headers: {}, config }
      }
      expect(config.url).toBe('/movies/import')
      expect(JSON.parse(config.data)).toEqual({ tmdbId: 123 })
      return {
        data: { message: 'Import started', jobId: 'import-movie-123' },
        status: 202,
        statusText: 'Accepted',
        headers: {},
        config,
      }
    })
    expect(await moviesService.searchTmdb('Dune')).toEqual([])
    expect((await moviesService.importMovie(123)).jobId).toBe(
      'import-movie-123',
    )
  })
  test('admin editing reads nullable fields without public presentation fallbacks', async () => {
    mockApiAdapter(async config => ({
      data: { ...original, description: null, backdropUrl: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    const details = await moviesService.getDetails(movieId)
    expect(details.description).toBeNull()
    expect(details.backdropUrl).toBeNull()
    expect(details.posterPublicId).toBe(image.publicId)
    expect(details.genreIds).toEqual([genreId])
  })
})

describe('safe movie editing', () => {
  test('unchanged form issues no patches and trailer-only changes omit images and metadata', async () => {
    expect(
      buildMovieUpdate(original, editValues(), {
        poster: false,
        backdrop: false,
      }),
    ).toEqual({})
    const changes = buildMovieUpdate(
      original,
      { ...editValues(), trailerUrl: 'https://youtu.be/new' },
      { poster: false, backdrop: false },
    )
    expect(changes).toEqual({ images: { trailerUrl: 'https://youtu.be/new' } })
    let requests = 0
    mockApiAdapter(async config => {
      requests++
      expect(JSON.parse(config.data)).toEqual(changes.images)
      return {
        data: '',
        status: 204,
        statusText: 'No Content',
        headers: {},
        config,
      }
    })
    await moviesService.update(movieId, {})
    expect(requests).toBe(0)
    await moviesService.update(movieId, changes)
    expect(requests).toBe(1)
  })
  test('replacement and explicit removal target one image only', () => {
    const next = { secureUrl: `${image.secureUrl}?new`, publicId: 'poster/new' }
    expect(
      buildMovieUpdate(
        original,
        { ...editValues(), poster: next },
        { poster: true, backdrop: false },
      ),
    ).toEqual({ images: { poster: next } })
    expect(
      buildMovieUpdate(
        original,
        { ...editValues(), poster: null },
        { poster: true, backdrop: false },
      ),
    ).toEqual({ images: { poster: null } })
    expect(
      buildMovieUpdate(
        original,
        { ...editValues(), description: 'New' },
        { poster: false, backdrop: false },
      ),
    ).toEqual({ details: { description: 'New' } })
  })
  test('stops on a patch failure and reports partial success', async () => {
    const calls: string[] = []
    mockApiAdapter(async config => {
      calls.push(config.url ?? '')
      if (config.url?.endsWith('/details')) throw new Error('Validation failed')
      return {
        data: '',
        status: 204,
        statusText: 'No Content',
        headers: {},
        config,
      }
    })
    try {
      await moviesService.update(movieId, {
        title: 'New',
        details: { description: 'New' },
        images: { poster: null },
        status: 3,
      })
      throw new Error('Expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(MovieUpdateError)
      expect((error as MovieUpdateError).completedUpdates).toBe(1)
      expect((error as Error).message).toContain('Частину змін уже збережено')
    }
    expect(calls).toEqual([
      `/movies/${movieId}/title`,
      `/movies/${movieId}/details`,
    ])
  })
})

test('file validation accepts supported images and rejects empty, large and unsupported files', () => {
  expect(
    validateMovieImage(new File(['x'], 'p.jpg', { type: 'image/jpeg' })),
  ).toBeNull()
  expect(
    validateMovieImage(new File(['x'], 'p.svg', { type: 'image/svg+xml' })),
  ).toContain('JPEG')
  expect(
    validateMovieImage(new File([], 'p.png', { type: 'image/png' })),
  ).toContain('порожній')
  expect(
    validateMovieImage(
      new File([new Uint8Array(maxMovieImageBytes + 1)], 'p.png', {
        type: 'image/png',
      }),
    ),
  ).toContain('10 МіБ')
})

test('movie invalidation refreshes the active Admin list and invalidates public caches', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  let calls = 0
  const key = ['admin-movies', 1, 'existing-filter']
  const observer = new QueryObserver(client, {
    queryKey: key,
    queryFn: async () => {
      calls++
      return calls === 1 ? [] : [original]
    },
  })
  const unsubscribe = observer.subscribe(() => {})
  try {
    await observer.refetch()
    client.setQueryData(['movies', 'catalogue'], [])
    client.setQueryData(['movie', movieId], original)
    await invalidateMovieQueries(client)
    expect(client.getQueryData(key)).toEqual([original])
    expect(client.getQueryState(['movies', 'catalogue'])?.isInvalidated).toBe(
      true,
    )
    expect(client.getQueryState(['movie', movieId])?.isInvalidated).toBe(true)
  } finally {
    unsubscribe()
    client.clear()
  }
})
