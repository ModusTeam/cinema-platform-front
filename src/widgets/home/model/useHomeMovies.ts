import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { moviesService } from '@/entities/movie/api/movies.service'
import { sessionsService } from '@/entities/session/api/sessions.service'
import { hallsService } from '@/entities/hall/api/halls.service'
import { addMovieSessionMetadata } from '@/features/movies/lib/movieSessionMetadata'

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

  const { data: movies = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['home-movies-aggregated'],
    queryFn: async () => {
      const [moviesData, allSessions, hallsData] = await Promise.all([
        moviesService.getAll(),
        sessionsService.getAll(),
        hallsService.getAll(),
      ])

      return addMovieSessionMetadata(moviesData, allSessions, hallsData)
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
    isError,
    refetch,
    activeFilter,
    setActiveFilter,
    filters: FILTERS,
  }
}
