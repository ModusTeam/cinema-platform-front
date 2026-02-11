import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Film, ArrowRight } from 'lucide-react'
import { GridLoader } from '../common/components/GridLoader'
import MovieCard from '../features/movies/components/MovieCard'
import PromoSection from '../features/home/components/PromoSection'
import HeroSection from '../features/movies/components/HeroSection'
import { useHomeMovies } from '../features/home/hooks/useHomeMovies'
import { MovieStatus } from '../types/movie'

const HomePage = () => {
  const { filteredMovies, isLoading, activeFilter, setActiveFilter, filters } =
    useHomeMovies()

  const moviesToShow = useMemo(() => {
    return filteredMovies
      .filter(movie => movie.status === MovieStatus.Active)
      .slice(0, 8)
  }, [filteredMovies])

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-[var(--bg-main)]'>
        <GridLoader className='h-12 w-12 animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--bg-main)] font-sans pb-20'>
      <HeroSection />

      <div className='container mx-auto px-4 -mt-10 relative z-10'>
        <div className='flex flex-col md:flex-row justify-between items-end mb-8 gap-6'>
          <h2 className='text-3xl font-black text-white pl-4 border-l-4 border-[var(--color-primary)] leading-none uppercase tracking-wide'>
            Зараз у кіно
          </h2>

          <div className='flex flex-wrap gap-2 p-1.5 bg-[var(--bg-card)]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-lg'>
            {filters.map(f => (
              <button
                type='button'
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeFilter === f.id
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25 scale-105'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {moviesToShow.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-dashed border-white/10 animate-in fade-in zoom-in duration-500'>
            <Film size={64} className='opacity-10 mb-6' />
            <p className='text-lg font-medium'>
              {filteredMovies.length > 0
                ? 'Немає активних сеансів для обраної категорії'
                : 'Фільмів поки що немає'}
            </p>
            <button
              type='button'
              onClick={() => setActiveFilter('all')}
              className='mt-6 text-[var(--color-primary)] hover:underline font-bold'
            >
              Скинути фільтри
            </button>
          </div>
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
            to='/sessions'
            className='group flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95'
          >
            Дивитись повний розклад
            <ArrowRight
              size={18}
              className='group-hover:translate-x-1 transition-transform'
            />
          </Link>
        </div>
      </div>

      <PromoSection />
    </div>
  )
}

export default HomePage
