import { Calendar, Clock, Info, Pause, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHeroSlider } from '@/features/movies/model/useHeroSlider'
import Button, { buttonStyles } from '@/shared/ui/Button'
import { GridLoader } from '@/shared/ui/GridLoader'
import { heroCopy } from '../config/hero.copy'

const HeroSection = () => {
  const {
    movies,
    activeMovie,
    currentIndex,
    isLoading,
    reducedMotion,
    isPaused,
    isAutoplaying,
    autoplayKey,
    setIsHovered,
    setHasFocus,
    toggleAutoplay,
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

  if (movies.length === 0) {
    return <div className='h-24 md:h-28' aria-hidden='true' />
  }

  return (
    <section
      aria-label={heroCopy.label}
      aria-roledescription={heroCopy.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setHasFocus(false)
      }}
      className='relative min-h-[85svh] w-full overflow-hidden bg-black'
    >
      <div className='absolute inset-0'>
        <img
          key={activeMovie.id}
          src={activeMovie.backdropUrl}
          alt={activeMovie.title}
          className='hero-image h-full w-full object-cover object-center'
        />

        <div className='absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/90 via-[var(--bg-main)]/20 to-transparent' />
        <div className='hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--bg-main)]/90 to-transparent pointer-events-none' />
      </div>

      <div className='relative container mx-auto flex min-h-[85svh] items-end px-4 pb-20 pt-40 lg:pt-28'>
        <div className='grid w-full lg:grid-cols-[1fr_350px] gap-12'>
          <div className='max-w-3xl space-y-6'>
            <div className='flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--text-main)]'>
              <span className='bg-[var(--surface-elevated)] text-[var(--text-main)] px-2.5 py-1 rounded-md'>
                Прем'єра
              </span>
              <span className='rating-badge'>
                <Star size={12} className='fill-current' aria-hidden='true' />{' '}
                {activeMovie.rating}
              </span>
              <span className='flex items-center gap-1.5'>
                <Calendar size={12} /> {activeMovie.year}
              </span>
              <span className='flex items-center gap-1.5'>
                <Clock size={12} /> {activeMovie.duration} хв
              </span>
            </div>

            <h1 className='type-public-display text-white'>
              {activeMovie.title}
            </h1>

            <p className='line-clamp-3 text-base leading-relaxed text-zinc-300 sm:text-lg max-w-2xl'>
              {activeMovie.description}
            </p>

            <div className='flex flex-wrap gap-4 pt-4'>
              <Button
                onClick={handleBuyTicket}
                className='rounded-full px-8 py-4 text-base'
              >
                <Play className='size-5 fill-current' />
                Купити квиток
              </Button>

              <Link
                to={`/movies/${activeMovie.id}`}
                className={`${buttonStyles('secondary')} rounded-full px-8 py-4 text-base`}
              >
                <Info className='size-5' />
                Детальніше
              </Link>
            </div>
          </div>

          <div className='hidden lg:flex flex-col justify-end gap-3'>
            <h3 className='text-sm font-medium text-[var(--text-muted)] mb-2 pl-1'>
              Далі у прокаті
            </h3>

            {movies.map((m, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  type='button'
                  key={m.id}
                  onClick={() => handleManualSelect(idx)}
                  aria-label={heroCopy.select(m.title, idx + 1, movies.length)}
                  aria-pressed={isActive}
                  className={`group relative flex items-center gap-4 p-2 rounded-xl transition-colors duration-150 text-left border ${
                    isActive
                      ? 'bg-white/10 border-white/20'
                      : 'bg-transparent border-transparent hover:bg-white/5'
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
                        <div className='w-2 h-2 bg-[var(--color-primary)] rounded-full'></div>
                      </div>
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div
                      className={`font-medium text-sm truncate transition-colors ${isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'}`}
                    >
                      {m.title}
                    </div>
                    <div className='text-xs text-[var(--text-muted)] truncate'>
                      {m.genres[0]} • {m.year}
                    </div>
                  </div>

                  {isActive && isAutoplaying && (
                    <div
                      aria-hidden='true'
                      className='absolute bottom-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden'
                    >
                      <div
                        key={`${m.id}-${autoplayKey}`}
                        className='hero-progress h-full bg-[var(--color-primary)] origin-left'
                        style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                      ></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className='lg:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-2'>
          {movies.map((movie, idx) => (
            <button
              type='button'
              key={movie.id}
              onClick={() => handleManualSelect(idx)}
              aria-label={heroCopy.select(movie.title, idx + 1, movies.length)}
              aria-pressed={idx === currentIndex}
              className='flex h-10 w-10 items-center justify-center rounded-full'
            >
              <span
                aria-hidden='true'
                className={`h-1.5 rounded-full ${
                  idx === currentIndex
                    ? 'w-8 bg-[var(--color-primary)]'
                    : 'w-2 bg-white/20'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {movies.length > 1 && (
        <div className='absolute right-4 top-24 md:top-28 z-10'>
          <Button
            variant='secondary'
            onClick={toggleAutoplay}
            disabled={reducedMotion}
            aria-label={
              reducedMotion
                ? heroCopy.reducedMotion
                : isPaused
                  ? heroCopy.resume
                  : heroCopy.pause
            }
            title={
              reducedMotion
                ? heroCopy.reducedMotion
                : isPaused
                  ? heroCopy.resume
                  : heroCopy.pause
            }
            className='rounded-full bg-black/70'
          >
            {isPaused || reducedMotion ? (
              <Play size={16} aria-hidden='true' />
            ) : (
              <Pause size={16} aria-hidden='true' />
            )}
            <span className='text-xs'>
              {reducedMotion
                ? heroCopy.manual
                : isPaused
                  ? heroCopy.resumeShort
                  : heroCopy.pauseShort}
            </span>
          </Button>
        </div>
      )}

      <style>{`
        @keyframes hero-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes hero-image {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-progress { animation: hero-progress linear forwards; }
          .hero-image { animation: hero-image 250ms ease-out; }
        }
      `}</style>
    </section>
  )
}

export default HeroSection
