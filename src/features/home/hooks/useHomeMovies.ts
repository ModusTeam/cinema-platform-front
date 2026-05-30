import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { moviesService } from '@/features/movies/api/movies.service'
import { bookingService } from '@/features/booking/api/booking.service'
import { hallsService } from '@/features/halls/api/halls.service'
import type { Movie } from '@/features/movies/model/movie.types'
import type { Session } from '@/features/halls/model/hall.types'

export interface MovieWithMeta extends Movie {
  sessions: Session[]
  technologies: string[]
}

const FILTERS = [
  { id: 'all', label: 'Всі' },
  { id: 'imax', label: 'IMAX' },
  { id: 'dolby', label: 'Dolby Atmos' },
  { id: 'dbox', label: 'D-Box' },
  { id: '3d', label: '3D' },
  { id: '4dx', label: '4DX' },
]

export const useHomeMovies = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['home-movies-aggregated'],
    queryFn: async () => {
      const [moviesData, allSessions, hallsData] = await Promise.all([
        moviesService.getAll(),
        bookingService.getAllSessions(),
        hallsService.getAll(),
      ])

      const hallTechMap: Record<string, string[]> = {}
      hallsData.forEach(hall => {
        hallTechMap[hall.id] = hall.technologies?.map(t => t.name) || []
      })

      return moviesData.map(movie => {
        const movieSessions = allSessions.filter(s => s.movieId === movie.id)

        const techSet = new Set<string>()
        movieSessions.forEach(session => {
          const techs = hallTechMap[session.hallId]
          if (techs) techs.forEach(t => techSet.add(t))
        })

        if (techSet.size === 0) techSet.add('2D')

        return {
          ...movie,
          sessions: movieSessions,
          technologies: Array.from(techSet),
        }
      })
    },
    staleTime: 5 * 60 * 1000,
  })

  const filteredMovies = movies.filter(movie => {
    if (activeFilter === 'all') return true

    const techs = movie.technologies.map(t => t.toLowerCase())
    if (activeFilter === 'imax') return techs.some(t => t.includes('imax'))
    if (activeFilter === 'dolby')
      return techs.some(t => t.includes('dolby') || t.includes('atmos'))
    if (activeFilter === 'dbox')
      return techs.some(t => t.includes('d-box') || t.includes('dbox'))
    if (activeFilter === '3d') return techs.some(t => t === '3d')
    if (activeFilter === '4dx') return techs.some(t => t.includes('4dx'))

    return true
  })

  return {
    filteredMovies,
    isLoading,
    activeFilter,
    setActiveFilter,
    filters: FILTERS,
  }
}
