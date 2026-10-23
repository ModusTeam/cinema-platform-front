import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moviesService } from '@/entities/movie/api/movies.service'
import { MovieStatus } from '@/entities/movie/model/movie.types'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'

const AUTO_PLAY_INTERVAL = 8000

export const useHeroSlider = () => {
  const navigate = useNavigate()
  const reducedMotion = useMotionPreference()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [isHidden, setIsHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )
  const [timerVersion, setTimerVersion] = useState(0)

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['hero-movies'],
    queryFn: async () => {
      const allMovies = await moviesService.getAll()
      return allMovies.filter(m => m.status === MovieStatus.Active).slice(0, 5)
    },
    staleTime: 5 * 60 * 1000,
  })

  // Keep the same film through reordering, or fall back safely after removal.
  const currentIndex = Math.max(
    0,
    movies.findIndex(m => m.id === selectedId),
  )
  const activeMovie = movies[currentIndex]
  const movieIds = JSON.stringify(movies.map(m => m.id))
  const isAutoplaying =
    movies.length > 1 &&
    !reducedMotion &&
    !isPaused &&
    !isHovered &&
    !hasFocus &&
    !isHidden

  useEffect(() => {
    const updateVisibility = () => setIsHidden(document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    updateVisibility()
    return () =>
      document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  const nextMovieId = movies[(currentIndex + 1) % movies.length]?.id
  // biome-ignore lint/correctness/useExhaustiveDependencies: List changes and repeated manual selection restart the full reading interval.
  useEffect(() => {
    if (!isAutoplaying || !nextMovieId) return
    const timer = window.setTimeout(() => {
      setSelectedId(nextMovieId)
    }, AUTO_PLAY_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [isAutoplaying, movieIds, nextMovieId, timerVersion])

  const handleManualSelect = (index: number) => {
    if (!movies[index]) return
    setSelectedId(movies[index].id)
    setTimerVersion(version => version + 1)
  }

  const handleBuyTicket = () => {
    if (activeMovie) navigate(`/booking/${activeMovie.id}`)
  }

  return {
    movies,
    activeMovie,
    currentIndex,
    isLoading,
    reducedMotion,
    isPaused,
    isAutoplaying,
    autoplayKey: `${movieIds}-${timerVersion}`,
    setIsHovered,
    setHasFocus,
    toggleAutoplay: () => setIsPaused(paused => !paused),
    handleManualSelect,
    handleBuyTicket,
    AUTO_PLAY_INTERVAL,
  }
}
