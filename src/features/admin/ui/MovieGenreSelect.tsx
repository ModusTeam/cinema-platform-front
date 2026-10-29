import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { genresService } from '../api/genres.service'

interface Props {
  value: string[]
  onChange: (ids: string[]) => void
  error?: string
}

export function MovieGenreSelect({ value, onChange, error }: Props) {
  const id = useId()
  const [search, setSearch] = useState('')
  const genres = useQuery({
    queryKey: ['genres'],
    queryFn: genresService.getAll,
  })
  const visibleGenres =
    genres.data?.filter(genre =>
      genre.name
        .toLocaleLowerCase('uk-UA')
        .includes(search.trim().toLocaleLowerCase('uk-UA')),
    ) ?? []

  return (
    <fieldset
      className='min-w-0 space-y-3'
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className='mb-3 text-base font-medium'>
        Жанри{' '}
        <span className='text-xs font-normal text-[var(--text-muted)]'>
          · вибрано {value.length}/50
        </span>
      </legend>
      <Input
        type='search'
        label='Знайти жанр'
        placeholder='Пошук серед наявних жанрів…'
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      {genres.isPending ? (
        <output className='field-hint'>Завантаження жанрів…</output>
      ) : genres.isError ? (
        <div>
          <p role='alert' className='field-error'>
            Не вдалося завантажити жанри. Можна продовжити без них.
          </p>
          <Button variant='ghost' onClick={() => void genres.refetch()}>
            Повторити
          </Button>
        </div>
      ) : (
        <>
          <div className='max-h-40 overflow-y-auto overscroll-contain border-y border-[var(--border-default)] py-2'>
            {visibleGenres.length ? (
              <div className='grid grid-cols-2 gap-x-4'>
                {visibleGenres.map(genre => (
                  <label
                    key={genre.id}
                    className='flex min-h-11 cursor-pointer items-center gap-3 text-sm'
                  >
                    <input
                      type='checkbox'
                      className='h-4 w-4 shrink-0 accent-[var(--color-primary)]'
                      checked={value.includes(genre.id)}
                      disabled={!value.includes(genre.id) && value.length >= 50}
                      onChange={event =>
                        onChange(
                          event.target.checked
                            ? [...new Set([...value, genre.id])]
                            : value.filter(selected => selected !== genre.id),
                        )
                      }
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className='field-hint'>
                {genres.data?.length
                  ? 'За цим запитом жанрів немає.'
                  : 'Жанрів поки немає. Цей розділ можна пропустити.'}
              </p>
            )}
          </div>
          {value.length > 0 && (
            <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]'>
              {value.map(selected => (
                <Button
                  key={selected}
                  variant='ghost'
                  className='px-2 text-xs'
                  onClick={() =>
                    onChange(value.filter(item => item !== selected))
                  }
                  aria-label={`Прибрати жанр ${genres.data?.find(genre => genre.id === selected)?.name ?? selected}`}
                >
                  {genres.data?.find(genre => genre.id === selected)?.name ??
                    selected}{' '}
                  ×
                </Button>
              ))}
            </div>
          )}
        </>
      )}
      {error && (
        <p id={`${id}-error`} role='alert' className='field-error'>
          {error}
        </p>
      )}
    </fieldset>
  )
}
