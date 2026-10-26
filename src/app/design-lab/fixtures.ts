import type { Movie, MovieDto } from '@/entities/movie/model/movie.types'
import { MovieStatus } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'

// Presentation fixtures only. No API client, auth, checkout or booking providers.
export const movieFixture = {
  id: '750828f9-c778-44f4-b010-7416abe6aa01',
  title: 'Бійцівський клуб',
  description:
    'Культова історія про пошук себе. Поверніться до фільму Девіда Фінчера на великому екрані.',
  durationMinutes: 139,
  rating: 8.8,
  releaseYear: 1999,
  posterUrl: '/placeholder-wip.jpg',
  backdropUrl: '/placeholder-wip.jpg',
  trailerUrl: null,
  genres: ['Драма', 'Трилер'],
  cast: [],
  status: MovieStatus.Active,
} satisfies MovieDto

// Explicit display adapter mirrors the existing DTO shape without importing API code.
export const movie: Movie = {
  id: movieFixture.id,
  title: movieFixture.title,
  description: movieFixture.description,
  duration: movieFixture.durationMinutes,
  rating: movieFixture.rating,
  year: movieFixture.releaseYear,
  posterUrl: movieFixture.posterUrl,
  backdropUrl: movieFixture.backdropUrl,
  genres: movieFixture.genres,
  cast: movieFixture.cast,
  status: movieFixture.status,
}

export const longTitle =
  'Бійцівський клуб: спеціальний показ оригінальної режисерської версії'

export const glyphSample =
  "Є є І і Ї ї Ґ ґ • п’ять • премʼєра • об'єкт • 0123456789 • 250 ₴"

export const typographyVariants = [
  { id: 'a', name: 'A. Montserrat', detail: 'Поточна гарнітура' },
  {
    id: 'b',
    name: 'B. Unbounded + Onest',
    detail: 'Виразні заголовки, спокійний інтерфейс',
  },
  {
    id: 'c',
    name: 'C. Roboto Condensed + Golos Text',
    detail: 'Кіноплакат і читабельний інтерфейс',
  },
] as const

export type TypographyVariant = (typeof typographyVariants)[number]['id']

// Relative dates keep the actual MovieCard's future-session filtering useful.
// The screenshot runner fixes browser time before opening this entry.
export function createSessionFixtures(): Session[] {
  return [16, 19, 21].map((hour, index) => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    start.setHours(hour, 30, 0, 0)
    return {
      id: `750828f9-c778-44f4-b010-7416abe6aa0${index + 2}`,
      movieId: movie.id,
      movieTitle: movie.title,
      hallId: '750828f9-c778-44f4-b010-7416abe6aa09',
      hallName: 'Зал 1',
      startTime: start.toISOString(),
      endTime: new Date(
        start.getTime() + movie.duration * 60_000,
      ).toISOString(),
      status: 'Scheduled',
      priceBase: 250,
    }
  })
}
