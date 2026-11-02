import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'
import { AchievementIcon } from '@/features/loyalty/achievements/AchievementIcon'
import { searchAchievementIcons } from '@/features/loyalty/achievements/achievementIconApi'
import {
  CURATED_ACHIEVEMENT_ICONS,
  resolveAchievementIcon,
} from '@/features/loyalty/achievements/achievementIcons'
import { cn } from '@/shared/lib/utils'
import Input from '@/shared/ui/Input'

interface AchievementIconPickerProps {
  value: string
  onChange: (identifier: string) => void
  error?: string
}

export function AchievementIconPicker({
  value,
  onChange,
  error,
}: AchievementIconPickerProps) {
  const id = useId()
  const [online, setOnline] = useState(false)
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const validQuery = /^[a-z0-9 -]+$/.test(normalizedQuery)

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(normalizedQuery),
      350,
    )
    return () => window.clearTimeout(timeout)
  }, [normalizedQuery])

  const search = useQuery({
    queryKey: ['achievement-icon-search', debouncedQuery],
    queryFn: ({ signal }) => searchAchievementIcons(debouncedQuery, signal),
    enabled:
      online &&
      validQuery &&
      normalizedQuery.length >= 2 &&
      debouncedQuery === normalizedQuery,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  const resolved = resolveAchievementIcon(value)
  const selectedLabel =
    resolved.kind === 'curated' ? resolved.icon.label : value
  const localIcons = CURATED_ACHIEVEMENT_ICONS.filter(icon =>
    `${icon.label} ${icon.keywords} ${icon.group}`
      .toLowerCase()
      .includes(filter.trim().toLowerCase()),
  )
  const results = online
    ? (search.data ?? []).map(identifier => ({
        id: identifier,
        label: identifier.split(':')[1].replaceAll('-', ' '),
      }))
    : localIcons
  const waiting =
    online &&
    validQuery &&
    normalizedQuery.length >= 2 &&
    (debouncedQuery !== normalizedQuery || search.isFetching)
  const showResults =
    !online ||
    (validQuery && normalizedQuery.length >= 2 && !waiting && !search.isError)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          className='selection-control px-4 py-2 text-sm font-semibold'
          aria-pressed={!online}
          onClick={() => setOnline(false)}
        >
          Рекомендовані · 30
        </button>
        <button
          type='button'
          className='selection-control px-4 py-2 text-sm font-semibold'
          aria-pressed={online}
          onClick={() => setOnline(true)}
        >
          Пошук інших
        </button>
      </div>
      {online ? (
        <Input
          label='Пошук англійською'
          value={query}
          maxLength={64}
          onChange={event => setQuery(event.target.value)}
          placeholder='Наприклад, coffee'
          hint='Лише колекція Retro. До 32 результатів. Потрібне з’єднання з Iconify.'
          error={
            query.trim() && !validQuery
              ? 'Введіть англійські літери, цифри, пробіли або дефіс.'
              : undefined
          }
        />
      ) : (
        <Input
          label='Знайти рекомендовану іконку'
          value={filter}
          onChange={event => setFilter(event.target.value)}
          placeholder='Назва українською або англійською'
        />
      )}
      <output className='block text-sm text-[var(--text-muted)]'>
        {waiting
          ? 'Шукаємо іконки…'
          : online && normalizedQuery.length < 2
            ? 'Введіть щонайменше 2 символи.'
            : null}
        {online && search.isError && debouncedQuery === normalizedQuery && (
          <span>
            Пошук недоступний. Рекомендовані іконки працюють без мережі.{' '}
            <button
              type='button'
              className='underline underline-offset-4'
              onClick={() => void search.refetch()}
            >
              Спробувати ще раз
            </button>
          </span>
        )}
        {showResults && results.length === 0
          ? 'Іконок не знайдено. Спробуйте іншу назву.'
          : null}
      </output>
      {showResults && results.length > 0 && (
        <div
          role='radiogroup'
          aria-label={
            online ? 'Результати пошуку Retro' : 'Рекомендовані іконки'
          }
          className='grid max-h-72 grid-cols-4 gap-2 overflow-y-auto p-1 lg:grid-cols-6'
        >
          {results.map(icon => (
            <label key={icon.id} className='relative min-w-0 cursor-pointer'>
              <input
                type='radio'
                name={`${id}-icon`}
                value={icon.id}
                checked={value === icon.id}
                onChange={() => onChange(icon.id)}
                className='peer sr-only'
              />
              <span
                className={cn(
                  'flex h-full min-h-20 flex-col items-center justify-center gap-2 border p-2 text-center text-xs leading-tight transition-colors motion-reduce:transition-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)] hover:bg-[var(--bg-hover)]',
                  value === icon.id
                    ? 'border-[var(--selection-border)] bg-[var(--selection-bg)] text-[var(--text-main)]'
                    : 'border-[var(--border-default)] text-[var(--text-muted)]',
                )}
              >
                <AchievementIcon identifier={icon.id} size={32} />
                <span className='w-full break-words'>{icon.label}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      <div className='flex items-center gap-3 border-t border-[var(--border-default)] pt-4'>
        <AchievementIcon identifier={value} size={36} className='shrink-0' />
        <p className='min-w-0 text-sm text-[var(--text-muted)]'>
          Обрано:{' '}
          <span className='break-words text-[var(--text-main)]'>
            {selectedLabel || 'Іконку не обрано'}
          </span>
        </p>
      </div>
      {resolved.kind === 'unknown' && (
        <p className='field-hint'>
          Ця збережена іконка не підтримується. Показуємо кубок; початкове
          значення залишиться, доки ви не оберете заміну.
        </p>
      )}
      {resolved.kind === 'remote' && (
        <p className='field-hint'>
          Іконка поза добіркою завантажується з Iconify. Якщо сервіс
          недоступний, з’явиться кубок.
        </p>
      )}
      {error && (
        <p role='alert' className='field-error'>
          {error}
        </p>
      )}
    </div>
  )
}
