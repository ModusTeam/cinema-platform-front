import { z } from 'zod'
import type { CreateMovieRequest } from '@/entities/movie/model/movie.types'

export const movieAgeRestrictions = ['0+', '7+', '12+', '16+', '18+'] as const
export const maximumReleaseYear = () => new Date().getUTCFullYear() + 10

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `Не більше ${maximum} символів`)
    .transform(value => value || undefined)

export const movieTrailerSchema = optionalText(500).refine(value => {
  if (!value) return true
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      !!url.hostname &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}, 'Введіть абсолютне HTTPS-посилання без облікових даних')

const imageReferenceSchema = z
  .object({
    secureUrl: z.url(),
    publicId: z.string().min(1).max(255),
  })
  .nullable()

export const movieFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Вкажіть назву')
    .max(200, 'Не більше 200 символів'),
  description: z
    .string()
    .trim()
    .min(1, 'Додайте опис')
    .max(2000, 'Не більше 2000 символів'),
  durationMinutes: z
    .number({ error: 'Вкажіть тривалість числом' })
    .int('Потрібне ціле число')
    .min(1, 'Від 1 хвилини')
    .max(600, 'Не більше 600 хвилин'),
  releaseYear: z
    .number({ error: 'Вкажіть рік числом' })
    .int('Потрібне ціле число')
    .min(1888, 'Рік від 1888')
    .refine(value => value <= maximumReleaseYear(), {
      error: () => `Рік до ${maximumReleaseYear()}`,
    }),
  status: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  rating: z
    .number({ error: 'Вкажіть рейтинг числом' })
    .min(0, 'Рейтинг від 0 до 10')
    .max(10, 'Рейтинг від 0 до 10')
    .refine(
      value => /^\d+(\.\d{1,2})?$/.test(String(value)),
      'Не більше двох знаків після крапки',
    )
    .optional(),
  ageRestriction: z
    .union([z.enum(movieAgeRestrictions), z.literal('')])
    .transform(value => value || undefined),
  genreIds: z
    .array(
      z
        .string()
        .regex(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )
        .refine(value => value !== '00000000-0000-0000-0000-000000000000'),
    )
    .max(50, 'Не більше 50 жанрів')
    .refine(
      values =>
        new Set(values.map(value => value.toLowerCase())).size ===
        values.length,
      'Жанри не мають повторюватися',
    ),
  poster: imageReferenceSchema,
  backdrop: imageReferenceSchema,
  trailerUrl: movieTrailerSchema,
  cast: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, 'Вкажіть ім’я')
          .max(200, 'Не більше 200 символів'),
        role: optionalText(200),
      }),
    )
    .max(50, 'Не більше 50 учасників')
    .refine(members => {
      const keys = members.map(member =>
        JSON.stringify([
          member.name.toUpperCase(),
          member.role?.toUpperCase() ?? null,
        ]),
      )
      return new Set(keys).size === keys.length
    }, 'Поєднання імені та ролі не мають повторюватися'),
})

export type MovieFormInput = z.input<typeof movieFormSchema>
export type MovieFormValues = z.output<typeof movieFormSchema>

export const movieFormDefaults: MovieFormInput = {
  title: '',
  description: '',
  durationMinutes: Number.NaN,
  releaseYear: new Date().getUTCFullYear(),
  status: 1,
  rating: undefined,
  ageRestriction: '',
  genreIds: [],
  poster: null,
  backdrop: null,
  trailerUrl: '',
  cast: [],
}

export function toCreateMovieRequest(
  values: MovieFormValues,
): CreateMovieRequest {
  return {
    title: values.title,
    description: values.description,
    durationMinutes: values.durationMinutes,
    releaseYear: values.releaseYear,
    status: values.status,
    ...(values.genreIds.length ? { genreIds: values.genreIds } : {}),
    ...(values.rating !== undefined ? { rating: values.rating } : {}),
    ...(values.ageRestriction ? { ageRestriction: values.ageRestriction } : {}),
    ...(values.poster ? { poster: values.poster } : {}),
    ...(values.backdrop ? { backdrop: values.backdrop } : {}),
    ...(values.trailerUrl ? { trailerUrl: values.trailerUrl } : {}),
    ...(values.cast.length ? { cast: values.cast } : {}),
  }
}
