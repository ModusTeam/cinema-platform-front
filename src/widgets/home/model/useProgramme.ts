import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { hallsService } from '@/entities/hall/api/halls.service'
import { moviesService } from '@/entities/movie/api/movies.service'
import { sessionsService } from '@/entities/session/api/sessions.service'
import { buildProgramme } from '../lib/programme'

export function useProgramme() {
  const movies = useQuery({
    queryKey: ['movies', 'programme'],
    queryFn: moviesService.getAll,
  })
  const sessions = useQuery({
    queryKey: ['sessions', 'programme'],
    queryFn: sessionsService.getAll,
    refetchInterval: 60_000,
  })
  const halls = useQuery({
    queryKey: ['halls', 'programme'],
    queryFn: hallsService.getAll,
  })
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  return {
    movies,
    sessions,
    halls,
    programme: buildProgramme(movies.data ?? [], sessions.data ?? [], now),
  }
}
