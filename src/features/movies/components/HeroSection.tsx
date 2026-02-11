import { Play, Info, Star, Calendar, Clock } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import { Link } from 'react-router-dom'
import { useHeroSlider } from '../hooks/useHeroSlider'

const HeroSection = () => {
  const {
    movies,
    activeMovie,
    currentIndex,
    isLoading,
    isAnimating,
    handleManualSelect,
    handleBuyTicket,
    AUTO_PLAY_INTERVAL,
  } = useHeroSlider()

  if (isLoading) {
    return (
      <div className='flex h-[85vh] w-full items-center justify-center bg-[var(--bg-main)]'>
        <GridLoader className='h-12 w-12 animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (movies.length === 0) return null

  return (
    <section className='relative h-[85vh] w-full overflow-hidden bg-black group'>
      <div className='absolute inset-0 transition-opacity duration-700 ease-in-out'>
        <img
          key={activeMovie.id}
          src={activeMovie.backdropUrl}
          alt={activeMovie.title}
          className={`h-full w-full object-cover object-center transition-transform duration-[20s] ease-linear scale-105 group-hover:scale-110 animate-in fade-in zoom-in-95 duration-1000`}
        />

        <div className='absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/90 via-[var(--bg-main)]/20 to-transparent' />
        <div className='hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--bg-main)]/90 to-transparent pointer-events-none' />
      </div>

      <div className='relative container mx-auto flex h-full items-end pb-20 px-4'>
        <div className='grid w-full lg:grid-cols-[1fr_350px] gap-12'>
          <div
            className={`max-w-3xl space-y-6 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <div className='flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-zinc-300'>
              <span className='bg-[var(--color-primary)] text-white px-2 py-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.4)]'>
                Прем'єра
              </span>
              <span className='flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10'>
                <Star size={12} className='text-yellow-500 fill-yellow-500' />{' '}
                {activeMovie.rating}
              </span>
              <span className='flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10'>
                <Calendar size={12} /> {activeMovie.year}
              </span>
              <span className='flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10'>
                <Clock size={12} /> {activeMovie.duration} хв
              </span>
            </div>

            <h1 className='text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-2xl'>
              {activeMovie.title}
            </h1>

            <p className='line-clamp-3 text-lg text-zinc-300 sm:text-xl max-w-2xl drop-shadow-md'>
              {activeMovie.description}
            </p>

            <div className='flex flex-wrap gap-4 pt-4'>
              <button
                type='button'
                onClick={handleBuyTicket}
                className='group flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95'
              >
                <Play className='size-5 fill-current' />
                Купити квиток
              </button>

              <Link
                to={`/movies/${activeMovie.id}`}
                className='flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:border-white active:scale-95'
              >
                <Info className='size-5' />
                Детальніше
              </Link>
            </div>
          </div>

          <div className='hidden lg:flex flex-col justify-end gap-3'>
            <h3 className='text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-1'>
              Далі у прокаті
            </h3>

            {movies.map((m, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  type='button'
                  key={m.id}
                  onClick={() => handleManualSelect(idx)}
                  className={`group relative flex items-center gap-4 p-2 rounded-xl transition-all duration-300 text-left border ${
                    isActive
                      ? 'bg-white/10 border-white/20 scale-105 shadow-xl'
                      : 'bg-transparent border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className='relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800'>
                    <img
                      src={m.backdropUrl}
                      alt={m.title}
                      className='h-full w-full object-cover'
                    />
                    {isActive && (
                      <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                        <div className='w-2 h-2 bg-[var(--color-primary)] rounded-full animate-ping'></div>
                      </div>
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div
                      className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}
                    >
                      {m.title}
                    </div>
                    <div className='text-xs text-zinc-500 truncate'>
                      {m.genres[0]} • {m.year}
                    </div>
                  </div>

                  {isActive && (
                    <div className='absolute bottom-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[var(--color-primary)] origin-left animate-progress'
                        style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                      ></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className='lg:hidden absolute bottom-8 left-0 right-0 flex justify-center gap-2'>
          {movies.map((_, idx) => (
            <button
              type='button'
              key={idx}
              onClick={() => handleManualSelect(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-[var(--color-primary)]'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
        .animate-progress {
            animation-name: progress;
            animation-timing-function: linear;
        }
      `}</style>
    </section>
  )
}

export default HeroSection
