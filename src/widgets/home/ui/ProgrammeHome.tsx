import { ArrowRight, Film } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import {
  formatProgrammeDate,
  formatProgrammeTime,
  programmeDay,
} from '../lib/programme'
import { useProgramme } from '../model/useProgramme'

function FilmArtwork({ movie, lead }: { movie: Movie; lead: boolean }) {
  const source = movie.backdropUrl.includes('placehold.co')
    ? movie.posterUrl
    : movie.backdropUrl || movie.posterUrl
  const [failedSource, setFailedSource] = useState<string>()
  return (
    <div className='programme-artwork'>
      {source && failedSource !== source ? (
        <img
          src={source}
          alt={`Кадр або постер фільму «${movie.title}»`}
          loading={lead ? 'eager' : 'lazy'}
          onError={() => setFailedSource(source)}
        />
      ) : (
        <div className='programme-missing'>
          <Film size={40} aria-hidden='true' />
          <span>Зображення ще немає</span>
        </div>
      )}
    </div>
  )
}

function Screenings({
  movie,
  sessions,
  hallNames,
}: {
  movie: Movie
  sessions: Session[]
  hallNames: Map<string, string>
}) {
  return (
    <div className='programme-screenings'>
      {sessions.length ? (
        sessions.map(session => (
          <Link
            className='programme-screening'
            key={session.id}
            to={`/booking/${movie.id}`}
            aria-label={`${movie.title}, ${formatProgrammeDate(programmeDay(session.startTime))}, ${formatProgrammeTime(session.startTime)}, ${hallNames.get(session.hallId) || session.hallName}. Перейти до вибору сеансу`}
          >
            <time dateTime={session.startTime}>
              {formatProgrammeTime(session.startTime)}
            </time>
            <span>{hallNames.get(session.hallId) || session.hallName}</span>
            <ArrowRight size={22} aria-hidden='true' />
          </Link>
        ))
      ) : (
        <p>На цю дату сеансів немає.</p>
      )}
    </div>
  )
}

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
    <fieldset className='programme-dates' aria-label='Дата сеансів'>
      {programme.dates.map(day => (
        <button
          type='button'
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
    <div className='programme-home'>
      <h1 className='programme-heading'>Кіно на ваш вечір</h1>
      {movies.isPending ? (
        <output className='programme-status'>Завантажуємо афішу…</output>
      ) : movies.isError ? (
        <UnavailableState
          title='Афіша тимчасово недоступна'
          onRetry={() => void movies.refetch()}
        />
      ) : (
        <>
          {sessions.isPending ? (
            <output className='programme-notice'>Завантажуємо сеанси…</output>
          ) : sessions.isError ? (
            <UnavailableState
              title='Не вдалося завантажити сеанси'
              description='Фільми доступні нижче. Спробуйте завантажити розклад ще раз.'
              onRetry={() => void sessions.refetch()}
            />
          ) : programme.dates.length === 0 ? (
            <p className='programme-notice'>
              Нові сеанси скоро зʼявляться. Поки оберіть фільм.
            </p>
          ) : null}
          {halls.isError && (
            <p className='programme-notice'>
              Назви залів показано з розкладу.{' '}
              <button type='button' onClick={() => void halls.refetch()}>
                Оновити дані залів
              </button>
            </p>
          )}
          {date && (
            <p
              className='programme-handoff'
              aria-live='polite'
              aria-atomic='true'
            >
              Сеанси на {formatProgrammeDate(date)} · Час Києва. На наступному
              кроці оберіть сеанс повторно. Знайдено: {visibleSessions.length}.
            </p>
          )}
          {visibleMovies.length === 0 ? (
            <EmptyState
              icon={<Film className='h-12 w-12' />}
              title='Афіша скоро поповниться'
              description='Коли фільми зʼявляться у прокаті, ви знайдете їх тут.'
            />
          ) : (
            visibleMovies.map((movie, index) => (
              <article
                className={`programme-film ${index === 0 ? 'programme-lead' : ''}`}
                // Keep the lead date controls mounted when its film changes.
                key={index === 0 ? 'lead' : movie.id}
              >
                <div className='programme-film-copy'>
                  <h2>
                    <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                  </h2>
                  <p className='programme-meta'>
                    {[
                      movie.genres.join(', '),
                      movie.duration > 0 ? `${movie.duration} хв` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className='programme-description'>{movie.description}</p>
                  <Link className='programme-detail' to={`/movies/${movie.id}`}>
                    Про фільм <ArrowRight size={18} aria-hidden='true' />
                  </Link>
                </div>
                <FilmArtwork movie={movie} lead={index === 0} />
                {!sessions.isPending && !sessions.isError && date && (
                  <div
                    className={
                      index === 0
                        ? 'programme-booking-band'
                        : 'programme-other-screenings'
                    }
                  >
                    {index === 0 && dateControls}
                    <Screenings
                      movie={movie}
                      sessions={visibleSessions.filter(
                        session => session.movieId === movie.id,
                      )}
                      hallNames={hallNames}
                    />
                  </div>
                )}
              </article>
            ))
          )}
        </>
      )}
      <Link className='programme-schedule' to='/sessions'>
        Перейти до розкладу <ArrowRight aria-hidden='true' />
      </Link>
    </div>
  )
}
