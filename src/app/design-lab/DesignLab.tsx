import {
  ArrowRight,
  CalendarDays,
  Check,
  Film,
  Menu,
  Ticket,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import MovieCard from '@/features/movies/ui/MovieCard'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import Input from '@/shared/ui/Input'
import {
  createSessionFixtures,
  glyphSample,
  longTitle,
  movie,
  type TypographyVariant,
  typographyVariants,
} from './fixtures'

export default function DesignLab() {
  const params = new URLSearchParams(window.location.search)
  const requestedVariant = params.get('variant')
  const initialVariant = typographyVariants.find(v => v.id === requestedVariant)
  const [variant, setVariant] = useState<TypographyVariant>(
    initialVariant?.id ?? 'a',
  )
  const [treatment, setTreatment] = useState(
    params.get('treatment') === 'current' ? 'current' : 'proposed',
  )
  const [state, setState] = useState(params.get('state') ?? 'ready')
  const [useLongTitle, setUseLongTitle] = useState(
    params.get('title') === 'long',
  )
  const [selectedSession, setSelectedSession] = useState(1)
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState(false)
  const [sessions] = useState(createSessionFixtures)
  const reducedMotion = useReducedMotion()
  const displayMovie = {
    ...movie,
    title: useLongTitle ? longTitle : movie.title,
  }
  const selection = sessions[selectedSession]

  return (
    <div
      className='design-lab'
      data-variant={variant}
      data-treatment={treatment}
    >
      <aside className='lab-toolbar' aria-label='Налаштування експерименту'>
        <div className='lab-toolbar-heading'>
          <strong>UI lab / Phase 1</strong>
          <span>МАКЕТНІ ДАНІ. Лише локальний експеримент.</span>
        </div>
        <div className='lab-toolbar-controls'>
          <label>
            Типографіка
            <select
              value={variant}
              onChange={e => {
                const next = typographyVariants.find(
                  v => v.id === e.target.value,
                )
                if (next) setVariant(next.id)
              }}
            >
              {typographyVariants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Поверхні
            <select
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
            >
              <option value='current'>Поточні</option>
              <option value='proposed'>Запропоновані</option>
            </select>
          </label>
          <label>
            Стан афіші
            <select value={state} onChange={e => setState(e.target.value)}>
              <option value='ready'>Сеанси</option>
              <option value='empty'>Порожньо</option>
              <option value='loading'>Завантаження</option>
            </select>
          </label>
          <label className='lab-checkbox'>
            <input
              type='checkbox'
              checked={useLongTitle}
              onChange={e => setUseLongTitle(e.target.checked)}
            />
            Довга назва (стрес-тест)
          </label>
        </div>
      </aside>

      <header className='lab-header lab-container flex items-center justify-between gap-4'>
        <a href='#featured' className='lab-logo'>
          Cine<span>ma</span>.
        </a>
        <nav aria-label='Навігація макета' className='flex items-center gap-6'>
          <a href='#catalog'>Афіша</a>
          <a href='#interface' className='lab-account-link'>
            Мій профіль
          </a>
          <button
            type='button'
            className='lab-menu'
            aria-label='Показати розділи макета'
            onClick={() =>
              setNotice('Розділи макета: афіша, профіль та зразки інтерфейсу.')
            }
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      <main>
        <section
          id='featured'
          className='lab-hero relative isolate'
          aria-labelledby='featured-title'
        >
          <img
            src={movie.backdropUrl}
            alt=''
            width={1600}
            height={900}
            className='lab-hero-image'
          />
          <div className='lab-hero-shade' />
          <div className='lab-container lab-hero-content flex items-end py-12 sm:py-16'>
            <div className='lab-hero-copy'>
              <div className='lab-metadata flex flex-wrap items-center'>
                <span className='lab-premiere'>Спеціальний показ</span>
                <span>8.8 IMDb</span>
                <span>1999</span>
                <span>139 хв</span>
              </div>
              <h1 id='featured-title'>{displayMovie.title}</h1>
              <p>{movie.description}</p>
              <div className='flex flex-wrap items-center gap-4'>
                <motion.button
                  type='button'
                  className='action action-primary lab-ticket'
                  whileHover={reducedMotion ? undefined : { y: -2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => {
                    document
                      .getElementById('session-heading')
                      ?.scrollIntoView({ behavior: 'instant', block: 'center' })
                    document
                      .getElementById('session-heading')
                      ?.focus({ preventScroll: true })
                  }}
                >
                  <Ticket size={18} aria-hidden='true' />
                  Купити квиток
                  <span className='lab-ticket-stub' aria-hidden='true'>
                    <ArrowRight size={18} />
                  </span>
                </motion.button>
                <a href='#catalog' className='lab-detail-link'>
                  Детальніше про показ
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className='lab-container lab-content-grid grid grid-cols-1 gap-10 py-8 sm:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] sm:gap-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-16'>
          <section
            id='catalog'
            className='min-w-0'
            aria-labelledby='catalog-heading'
          >
            <div className='lab-section-header'>
              <h2 id='catalog-heading'>Зараз у кіно</h2>
              <span>Зразок картки з афіші</span>
            </div>
            {state === 'empty' ? (
              <EmptyState
                icon={<CalendarDays className='h-12 w-12' />}
                title='Немає сеансів на цю дату'
                description='Оберіть інший день у календарі, щоб знайти доступні покази.'
                actionLabel='Повернути сеанси'
                onAction={() => setState('ready')}
                className='lab-empty'
              />
            ) : state === 'loading' ? (
              <output className='lab-skeleton'>
                <div className='lab-skeleton-image motion-safe:animate-pulse' />
                <p>Завантажуємо афішу…</p>
              </output>
            ) : (
              <div className='lab-movie-card'>
                <MovieCard
                  movie={displayMovie}
                  sessions={sessions}
                  technologies={['2D', 'Dolby Atmos']}
                />
              </div>
            )}
            <p className='lab-caption'>
              Місцевий кадр із public/placeholder-wip.jpg. Кадр також
              використано як тестовий постер.
            </p>
          </section>

          <section
            id='interface'
            className='min-w-0 lab-interface grid content-start gap-6 sm:gap-8'
            aria-label='Зразки інтерфейсу'
          >
            <div className='lab-panel'>
              <h2 id='session-heading' tabIndex={-1}>
                Оберіть сеанс
              </h2>
              <div className='lab-date-row flex flex-wrap items-center gap-2'>
                <CalendarDays size={18} aria-hidden='true' />
                <span>
                  Завтра,{' '}
                  {new Date(sessions[0].startTime).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <span className='lab-caption'>Зал 1 / 2D</span>
              </div>
              <fieldset className='lab-sessions' aria-label='Час сеансу'>
                {sessions.map((session, index) => (
                  <button
                    type='button'
                    key={session.id}
                    className='selection-control'
                    aria-pressed={index === selectedSession}
                    onClick={() => setSelectedSession(index)}
                  >
                    <span>
                      {new Date(session.startTime).toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <small>250 ₴</small>
                    {index === selectedSession && (
                      <Check size={14} aria-label='Обрано' />
                    )}
                  </button>
                ))}
              </fieldset>
              <output className='lab-caption lab-selection-status'>
                Обрано:{' '}
                {new Date(selection.startTime).toLocaleTimeString('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                . Це демонстрація, місця не резервуються.
              </output>
            </div>

            <form
              className='lab-panel'
              onSubmit={e => {
                e.preventDefault()
                setSaved(true)
              }}
            >
              <h2>Мій профіль</h2>
              <div className='lab-form-grid grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <Input
                  label='Ім’я'
                  defaultValue='Євгенія'
                  required
                  autoComplete='given-name'
                />
                <Input
                  label='Прізвище'
                  defaultValue='Ґалаґан'
                  required
                  autoComplete='family-name'
                />
                <Input
                  label='Дата народження'
                  type='date'
                  defaultValue='1994-08-24'
                />
                <Input
                  label='Час нагадування'
                  type='time'
                  defaultValue='18:30'
                />
              </div>
              <div className='flex flex-wrap items-center gap-3'>
                <Button type='submit' variant='secondary'>
                  Зберегти зміни
                </Button>
                <Button disabled variant='ghost'>
                  Недоступно
                </Button>
              </div>
              {saved && (
                <output className='lab-success'>
                  Зміни показано лише в макеті.
                </output>
              )}
            </form>

            <section className='lab-panel' aria-labelledby='history-heading'>
              <h2 id='history-heading'>Історія балів</h2>
              <div className='overflow-auto'>
                <table className='lab-table'>
                  <caption className='sr-only'>
                    Тестові операції лояльності
                  </caption>
                  <thead>
                    <tr>
                      <th scope='col'>Дата</th>
                      <th scope='col'>Операція</th>
                      <th scope='col'>Бали</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>24.10.2026</td>
                      <td>Нараховано за квиток</td>
                      <td className='lab-success'>+125</td>
                    </tr>
                    <tr>
                      <td>18.10.2026</td>
                      <td>Використано бали</td>
                      <td>−80</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='lab-status-row flex flex-wrap gap-x-4 gap-y-2'>
                <span className='lab-status lab-success'>✓ Успішно</span>
                <span className='lab-status lab-warning'>Увага: зразок</span>
                <span className='lab-status lab-error'>Помилка: зразок</span>
              </div>
            </section>
          </section>
        </div>

        <section
          className='lab-container lab-type-specimen'
          aria-labelledby='specimen-heading'
        >
          <h2 id='specimen-heading'>Українська типографіка</h2>
          <p className='lab-display-glyphs' data-glyphs='display'>
            {glyphSample}
          </p>
          <p data-glyphs='body'>{glyphSample}</p>
          <h3 className='lab-long-specimen'>{longTitle}</h3>
          <p className='lab-caption'>
            Синтетична довга назва для перевірки перенесення. Це не анонс нового
            релізу.
          </p>
          <div className='lab-action-samples flex flex-wrap items-center gap-6'>
            <Button isLoading>Завантаження</Button>
            <Button
              variant='destructive'
              onClick={() =>
                setNotice('Це лише зразок деструктивної дії. Дані не видалено.')
              }
            >
              <Film size={16} /> Видалити зразок
            </Button>
            <Input
              label='Зразок помилки поля'
              defaultValue='невірна адреса'
              error='Перевірте адресу електронної пошти.'
              aria-label='Зразок помилки поля'
            />
          </div>
          <output className='lab-notice'>{notice}</output>
        </section>
      </main>
      <footer className='lab-container lab-footer flex flex-wrap justify-between gap-3'>
        <span>Cinema / експеримент інтерфейсу</span>
        <span>Дані та ціни демонстраційні. Оплата відсутня.</span>
      </footer>
    </div>
  )
}
