import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { Calendar, CalendarDays, Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { hallsService } from '@/entities/hall/api/halls.service'
import { moviesService } from '@/entities/movie/api/movies.service'
import { MovieStatus } from '@/entities/movie/model/movie.types'
import { sessionsService } from '@/entities/session/api/sessions.service'
import { addMovieSessionMetadata } from '@/features/movies/lib/movieSessionMetadata'
import MovieCard from '@/features/movies/ui/MovieCard'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'

const generateDates = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

const isSameDate = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const MoviesGrid = () => {
  const [activeTab, setActiveTab] = useState<'now' | 'soon'>('now')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const dates = generateDates()

  const {
    data: movies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['home-movies-aggregated'],
    queryFn: async () => {
      const [moviesData, allSessions, hallsData] = await Promise.all([
        moviesService.getAll(),
        sessionsService.getAll(),
        hallsService.getAll(),
      ])

      return addMovieSessionMetadata(
        moviesData.filter(movie => movie.status !== MovieStatus.Archived),
        allSessions,
        hallsData,
      )
    },
    staleTime: 5 * 60 * 1000,
  })

  const displayedMovies = useMemo(() => {
    let filtered = []

    if (activeTab === 'soon') {
      filtered = movies.filter(m => m.status === MovieStatus.ComingSoon)
    } else {
      filtered = movies
        .filter(m => m.status === MovieStatus.Active)
        .filter(m => {
          return m.sessions.some(s =>
            isSameDate(new Date(s.startTime), selectedDate),
          )
        })
    }

    return filtered.slice(0, 8)
  }, [movies, activeTab, selectedDate])

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <GridLoader className='h-10 w-10 animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (isError && movies.length === 0) {
    return <UnavailableState onRetry={() => void refetch()} className='py-20' />
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between'>
        <div className='bg-[var(--bg-card)] p-1 rounded-xl border border-white/10 flex'>
          <button
            type='button'
            onClick={() => setActiveTab('now')}
            aria-pressed={activeTab === 'now'}
            className={clsx(
              'selection-control px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2',
              activeTab === 'now' && 'shadow-lg',
            )}
          >
            <CalendarDays size={16} /> Розклад
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('soon')}
            aria-pressed={activeTab === 'soon'}
            className={clsx(
              'selection-control px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2',
              activeTab === 'soon' && 'shadow-lg',
            )}
          >
            <Clock size={16} /> Скоро
          </button>
        </div>

        {activeTab === 'now' && (
          <div className='w-full xl:w-auto overflow-x-auto overflow-y-hidden py-2 px-2 no-scrollbar -mx-2 xl:mx-0'>
            <div className='flex gap-3 min-w-max items-center'>
              {dates.map(date => {
                const isSelected = isSameDate(date, selectedDate)
                const isToday = isSameDate(date, new Date())

                const dayName = date.toLocaleDateString('uk-UA', {
                  weekday: 'short',
                })
                const dayNum = date.getDate()

                return (
                  <button
                    type='button'
                    key={date.toDateString()}
                    onClick={() => setSelectedDate(date)}
                    aria-pressed={isSelected}
                    className={clsx(
                      'selection-control flex flex-col items-center justify-center w-14 h-16 rounded-xl',
                      isSelected &&
                        'shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-110 z-10 font-bold',
                    )}
                  >
                    <span className='text-[10px] uppercase tracking-wider opacity-80'>
                      {isToday ? 'Сьог' : dayName}
                    </span>
                    <span className='text-xl leading-none mt-0.5'>
                      {dayNum}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className='min-h-[400px]'>
        {displayedMovies.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'now' ? (
                <Calendar className='h-12 w-12' />
              ) : (
                <Clock className='h-12 w-12' />
              )
            }
            title={
              activeTab === 'now'
                ? 'Немає сеансів на цю дату'
                : 'Анонси ще готуються'
            }
            description={
              activeTab === 'now'
                ? 'Оберіть інший день у календарі, щоб знайти доступні покази та забронювати місця.'
                : 'Нові премʼєри зʼявляться тут після додавання в афішу кінотеатру.'
            }
            actionLabel={
              activeTab === 'now' ? 'Повернутися на сьогодні' : undefined
            }
            onAction={
              activeTab === 'now'
                ? () => setSelectedDate(new Date())
                : undefined
            }
            className='py-20'
          />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {displayedMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                sessions={
                  activeTab === 'now'
                    ? movie.sessions.filter(s =>
                        isSameDate(new Date(s.startTime), selectedDate),
                      )
                    : []
                }
                technologies={movie.technologies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MoviesGrid
