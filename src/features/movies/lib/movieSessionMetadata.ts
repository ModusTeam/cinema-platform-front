import type { HallSummaryDto } from '@/entities/hall/api/halls.service'
import type { Session } from '@/entities/hall/model/hall.types'
import type { Movie } from '@/entities/movie/model/movie.types'

interface MovieWithMeta extends Movie {
  sessions: Session[]
  technologies: string[]
}

export const addMovieSessionMetadata = (
  movies: Movie[],
  sessions: Session[],
  halls: HallSummaryDto[],
): MovieWithMeta[] => {
  const hallTechnologies: Record<string, string[]> = {}
  halls.forEach(hall => {
    hallTechnologies[hall.id] =
      hall.technologies?.map(technology => technology.name) || []
  })

  return movies.map(movie => {
    const movieSessions = sessions.filter(
      session => session.movieId === movie.id,
    )
    const technologies = new Set<string>()

    movieSessions.forEach(session => {
      const hallTechnologyNames = hallTechnologies[session.hallId]
      if (hallTechnologyNames) {
        hallTechnologyNames.forEach(name => technologies.add(name))
      }
    })

    if (technologies.size === 0) technologies.add('2D')

    return {
      ...movie,
      sessions: movieSessions,
      technologies: Array.from(technologies),
    }
  })
}
