import { motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import type { CatalogueCategory } from '@/entities/movie/lib/catalogue'
import {
  localDateKey,
  parseLocalDate,
} from '@/entities/session/lib/sessionDates'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import { catalogueCopy as copy } from '../config/catalogue.copy'
import Catalogue from './Catalogue'
import DailySchedule from './DailySchedule'
import './catalogue.css'

export default function MoviesGrid() {
  const [params, setParams] = useSearchParams()
  const reducedMotion = useMotionPreference()
  const schedule =
    params.get('mode') === 'schedule' ||
    (!params.has('mode') && params.has('date'))
  const view = params.get('view') === 'index' ? 'index' : 'posters'
  const category: CatalogueCategory =
    params.get('category') === 'soon'
      ? 'soon'
      : params.get('category') === 'active'
        ? 'active'
        : 'all'
  const date = localDateKey(parseLocalDate(params.get('date')) ?? new Date())
  const update = (values: Record<string, string | null>) => {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(values)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }
  const screeningLink = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('mode', 'schedule')
    next.set('date', date)
    next.set('movie', id)
    return `/sessions?${next}`
  }

  return (
    <div className='catalogue font-public min-h-[70svh]'>
      <div className='mx-auto max-w-[1600px] px-4 pb-20 pt-10 sm:px-8 lg:px-16 lg:pt-16'>
        <div className='mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end lg:mb-14'>
          <h1 className='catalogue-heading'>
            {schedule ? copy.scheduleTitle : copy.title}
          </h1>
          <p className='max-w-[32ch] text-base leading-relaxed text-[var(--text-muted)]'>
            {schedule ? copy.scheduleIntro : copy.intro}
          </p>
        </div>
        <nav
          aria-label='Фільми та розклад'
          className='mb-8 flex flex-wrap gap-x-8 border-b border-[var(--catalogue-rule)]'
        >
          <button
            type='button'
            aria-pressed={!schedule}
            className='catalogue-nav pb-4'
            onClick={() => update({ mode: 'films' })}
          >
            {copy.title}
          </button>
          <button
            type='button'
            aria-pressed={schedule}
            className='catalogue-nav pb-4'
            onClick={() => update({ mode: 'schedule' })}
          >
            {copy.scheduleTitle}
          </button>
        </nav>
        <motion.div
          key={schedule ? 'schedule' : 'films'}
          initial={reducedMotion ? false : { opacity: 0.85, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          {schedule ? (
            <DailySchedule
              date={date}
              movieId={params.get('movie') ?? undefined}
              onDateChange={value => update({ date: value })}
              onClearMovie={() => update({ movie: null })}
              onBrowse={() => update({ mode: 'films' })}
            />
          ) : (
            <>
              <div className='mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-[var(--catalogue-rule)] pb-4'>
                <fieldset
                  className='flex flex-wrap gap-x-6 gap-y-1'
                  aria-label='Категорія фільмів'
                >
                  {copy.categories.map(item => (
                    <button
                      key={item.value}
                      type='button'
                      aria-pressed={category === item.value}
                      className='catalogue-control'
                      onClick={() => update({ category: item.value })}
                    >
                      {item.label}
                    </button>
                  ))}
                </fieldset>
                <fieldset
                  className='flex flex-wrap gap-x-6'
                  aria-label='Вигляд каталогу'
                >
                  <button
                    type='button'
                    aria-pressed={view === 'posters'}
                    className='catalogue-control'
                    onClick={() => update({ view: 'posters' })}
                  >
                    {copy.gallery}
                  </button>
                  <button
                    type='button'
                    aria-pressed={view === 'index'}
                    className='catalogue-control'
                    onClick={() => update({ view: 'index' })}
                  >
                    {copy.index}
                  </button>
                </fieldset>
              </div>
              <p className='mb-8 max-w-[65ch] text-sm leading-relaxed text-[var(--text-muted)]'>
                {copy.availability}
              </p>
              <Catalogue
                category={category}
                view={view}
                screeningLink={screeningLink}
                onReset={() => update({ category: 'all' })}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
