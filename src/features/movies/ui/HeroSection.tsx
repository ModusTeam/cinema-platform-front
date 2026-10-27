import {
  ArrowDown,
  Calendar,
  Clock,
  Info,
  Pause,
  Play,
  Star,
} from 'lucide-react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useHeroSlider } from '@/features/movies/model/useHeroSlider'
import Button, { buttonStyles } from '@/shared/ui/Button'
import { GridLoader } from '@/shared/ui/GridLoader'
import TicketAction from '@/shared/ui/TicketAction'
import { heroCopy } from '../config/hero.copy'
import './hero-section.css'

const HeroSection = () => {
  const slider = useHeroSlider()
  if (slider.isLoading) {
    return (
      <div className='cinema-hero cinema-hero-loading flex w-full items-center justify-center bg-[var(--bg-main)]'>
        <GridLoader className='h-12 w-12 animate-spin motion-reduce:animate-none text-[var(--color-primary)]' />
      </div>
    )
  }
  if (slider.movies.length === 0) {
    return <div className='h-24 md:h-28' aria-hidden='true' />
  }
  return <FeaturedHero slider={slider} />
}

const FeaturedHero = ({
  slider,
}: {
  slider: ReturnType<typeof useHeroSlider>
}) => {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 64])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.045])
  const {
    movies,
    activeMovie,
    currentIndex,
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
  } = slider

  return (
    <section
      ref={heroRef}
      aria-label={heroCopy.label}
      aria-roledescription={heroCopy.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setHasFocus(false)
      }}
      className='cinema-hero relative w-full overflow-hidden bg-[var(--bg-main)]'
    >
      <div className='absolute inset-0'>
        <motion.div
          className='cinema-hero-depth absolute inset-0'
          style={reducedMotion ? undefined : { y: imageY, scale: imageScale }}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={activeMovie.id}
              src={activeMovie.backdropUrl}
              alt=''
              initial={{ opacity: reducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                ease: 'easeOut',
              }}
              fetchPriority='high'
              loading='eager'
              decoding='async'
              className='cinema-hero-image h-full w-full object-cover object-center'
            />
          </AnimatePresence>
        </motion.div>

        <div className='absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/90 via-[var(--bg-main)]/20 to-transparent' />
        <div className='hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--bg-main)]/90 to-transparent pointer-events-none' />
      </div>

      <div className='cinema-hero-content relative container mx-auto flex items-end px-4'>
        <div className='grid w-full lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] gap-10 xl:gap-16'>
          <div className='min-w-0 max-w-4xl space-y-6'>
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

            <h1
              key={`title-${activeMovie.id}`}
              className='cinema-hero-title cinema-hero-copy text-[var(--text-main)]'
            >
              {activeMovie.title}
            </h1>

            <p
              key={`description-${activeMovie.id}`}
              className='cinema-hero-copy line-clamp-3 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg max-w-xl'
            >
              {activeMovie.description}
            </p>

            <div className='flex flex-wrap items-center gap-3 pt-2'>
              <TicketAction onClick={handleBuyTicket}>
                Купити квиток
              </TicketAction>

              <Link
                to={`/movies/${activeMovie.id}`}
                className={`${buttonStyles('secondary')} min-h-14 px-6 py-3.5 text-base`}
              >
                <Info className='size-5' />
                Детальніше
              </Link>
            </div>
            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm'>
              <a
                href='#home-programme'
                className='inline-flex min-h-11 items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)]'
              >
                <ArrowDown size={16} aria-hidden='true' />
                {heroCopy.programme}
              </a>
              <Link
                to='/sessions?mode=schedule'
                className='inline-flex min-h-11 items-center text-[var(--text-muted)] hover:text-[var(--text-main)]'
              >
                {heroCopy.schedule}
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
                  className={`group relative flex items-center gap-4 p-2 rounded-xl transition-colors duration-150 text-left ${
                    isActive ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'
                  }`}
                >
                  <div className='relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800'>
                    <img
                      src={m.backdropUrl}
                      alt=''
                      loading='lazy'
                      decoding='async'
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
              className='flex h-11 w-11 items-center justify-center rounded-full'
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
    </section>
  )
}

export default HeroSection
