import { ArrowRight, Film } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { formatProgrammeDate, programmeDay } from '../lib/programme'
import { useProgramme } from '../model/useProgramme'
import { ProgrammeFilm } from './ProgrammeFilm'

export default function ProgrammeHome() {
  const { movies, sessions, halls, programme } = useProgramme()
  const [chosenDate, setChosenDate] = useState<string>()
  const date = sessions.isError
    ? undefined
    : chosenDate && programme.dates.includes(chosenDate)
      ? chosenDate
      : programme.dates[0]
  const visibleSessions = programme.sessions.filter(
    session => programmeDay(session.startTime) === date,
  )
  const scheduledIds = new Set(visibleSessions.map(session => session.movieId))
  const visibleMovies = date
    ? programme.movies.filter(movie => scheduledIds.has(movie.id))
    : programme.movies
  const hallNames = new Map(halls.data?.map(hall => [hall.id, hall.name]))

  const dateControls = (
    <fieldset
      className='programme-dates flex min-w-0 flex-[1_1_280px] flex-wrap gap-2'
      aria-label='Дата сеансів'
    >
      {programme.dates.map(day => (
        <button
          type='button'
          className='min-h-12 cursor-pointer border-b-2 border-[var(--signal-blue)] px-3 py-2.5 font-semibold aria-pressed:border-[var(--signal-ink)] aria-pressed:bg-[var(--signal-yellow)] aria-pressed:text-[var(--signal-ink)] aria-pressed:underline md:px-[18px]'
          key={day}
          aria-pressed={day === date}
          onClick={() => setChosenDate(day)}
        >
          {formatProgrammeDate(day)}
        </button>
      ))}
    </fieldset>
  )

  return (
    <div className='programme-home mx-auto max-w-[1536px] px-4 pb-10 md:px-8 md:pb-16'>
      <h1 className='pt-5 pb-4 text-lg font-semibold md:pt-6'>
        Кіно на ваш вечір
      </h1>
      {movies.isPending ? (
        <output className='block py-6'>Завантажуємо афішу…</output>
      ) : movies.isError ? (
        <UnavailableState
          className='rounded-none [&>div]:rounded-none'
          title='Афіша тимчасово недоступна'
          onRetry={() => void movies.refetch()}
        />
      ) : (
        <>
          {sessions.isPending ? (
            <output className='block py-6'>Завантажуємо сеанси…</output>
          ) : sessions.isError ? (
            <UnavailableState
              className='rounded-none [&>div]:rounded-none'
              title='Не вдалося завантажити сеанси'
              description='Фільми доступні нижче. Спробуйте завантажити розклад ще раз.'
              onRetry={() => void sessions.refetch()}
            />
          ) : programme.dates.length === 0 ? (
            <p className='block py-6'>
              Нові сеанси скоро зʼявляться. Поки оберіть фільм.
            </p>
          ) : null}
          {halls.isError && (
            <p className='block py-6'>
              Назви залів показано з розкладу.{' '}
              <button
                type='button'
                className='cursor-pointer underline'
                onClick={() => void halls.refetch()}
              >
                Оновити дані залів
              </button>
            </p>
          )}
          {date && (
            <p
              className='py-3 text-sm text-[var(--text-muted)]'
              aria-live='polite'
              aria-atomic='true'
            >
              Сеанси на {formatProgrammeDate(date)} · Час Києва. На наступному
              кроці оберіть сеанс повторно. Знайдено: {visibleSessions.length}.
            </p>
          )}
          {visibleMovies.length === 0 ? (
            <EmptyState
              className='rounded-none [&>div]:rounded-none'
              icon={<Film className='h-12 w-12' />}
              title='Афіша скоро поповниться'
              description='Коли фільми зʼявляться у прокаті, ви знайдете їх тут.'
            />
          ) : (
            visibleMovies.map((movie, index) => (
              <ProgrammeFilm
                // Keep the lead date controls mounted when its film changes.
                key={index === 0 ? 'lead' : movie.id}
                movie={movie}
                lead={index === 0}
                sessions={visibleSessions.filter(
                  session => session.movieId === movie.id,
                )}
                hallNames={hallNames}
                dateControls={dateControls}
                showScreenings={
                  !sessions.isPending && !sessions.isError && Boolean(date)
                }
              />
            ))
          )}
        </>
      )}
      <Link
        className='flex justify-between gap-6 border-b-2 border-[var(--signal-blue)] py-6 font-programme-display text-[1.75rem] leading-[1.3] font-semibold'
        to='/sessions'
      >
        Перейти до розкладу <ArrowRight aria-hidden='true' />
      </Link>
    </div>
  )
}
