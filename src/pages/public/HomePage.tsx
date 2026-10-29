import { ArrowRight, Film } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MovieStatus } from '@/entities/movie/model/movie.types'
import HeroSection from '@/features/movies/ui/HeroSection'
import MovieCard from '@/features/movies/ui/MovieCard'
import { buttonStyles } from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'
import { useHomeMovies } from '@/widgets/home/model/useHomeMovies'
import HomeScroll from '@/widgets/home/ui/HomeScroll'
import ProgrammeHeading from '@/widgets/home/ui/ProgrammeHeading'
import PromoSection from '@/widgets/home/ui/PromoSection'

const HomePage = () => {
  const {
    filteredMovies,
    isLoading,
    isError,
    refetch,
    activeFilter,
    setActiveFilter,
    filters,
  } = useHomeMovies()

  const moviesToShow = useMemo(() => {
    return filteredMovies
      .filter(movie => movie.status === MovieStatus.Active)
      .slice(0, 8)
  }, [filteredMovies])

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-[var(--bg-main)]'>
        <GridLoader className='h-12 w-12 animate-spin motion-reduce:animate-none text-[var(--color-primary)]' />
      </div>
    )
  }

  return (
    <div className='font-public min-h-screen bg-[var(--bg-main)] pb-20'>
      <HomeScroll />
      <HeroSection />

      <section
        id='home-programme'
        aria-label='Програма кінотеатру'
        tabIndex={-1}
        className='container relative z-10 mx-auto scroll-mt-28 px-4 pt-10'
      >
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6'>
          <ProgrammeHeading />

          <div className='flex flex-wrap gap-2'>
            {filters.map(f => (
              <button
                type='button'
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                aria-pressed={activeFilter === f.id}
                className='selection-control px-4 py-2 rounded-lg text-sm font-medium'
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isError && filteredMovies.length === 0 ? (
          <UnavailableState onRetry={() => void refetch()} className='py-32' />
        ) : moviesToShow.length === 0 ? (
          <EmptyState
            icon={<Film className='h-14 w-14' />}
            title={
              filteredMovies.length > 0
                ? 'Немає фільмів у цій добірці'
                : 'Афіша скоро поповниться'
            }
            description={
              filteredMovies.length > 0
                ? 'Скиньте фільтр, щоб побачити всі активні фільми та доступні сеанси.'
                : 'Коли адміністратори додадуть фільми до прокату, вони зʼявляться тут.'
            }
            actionLabel='Скинути фільтри'
            onAction={() => setActiveFilter('all')}
            className='py-32'
          />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8'>
            {moviesToShow.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                sessions={movie.sessions}
                technologies={movie.technologies}
              />
            ))}
          </div>
        )}

        <div className='mt-12 flex justify-center'>
          <Link
            to='/sessions?mode=schedule'
            className={`${buttonStyles('secondary')} group px-6 py-4`}
          >
            Дивитись повний розклад
            <ArrowRight
              size={18}
              className='motion-safe:group-hover:translate-x-1 transition-transform duration-150'
            />
          </Link>
        </div>
      </section>

      <PromoSection />
    </div>
  )
}

export default HomePage
