import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { moviesService } from '@/entities/movie/api/movies.service'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'
import {
  type MovieFormInput,
  type MovieFormValues,
  maximumReleaseYear,
  movieAgeRestrictions,
  movieFormDefaults,
  movieFormSchema,
  toCreateMovieRequest,
} from '../model/movieForm.schema'
import { invalidateMovieQueries } from '../model/movieQueries'
import { MovieGenreSelect } from './MovieGenreSelect'
import { MovieImageUpload } from './MovieImageUpload'

interface Props {
  onClose: () => void
  onSuccess: (id: string, title: string) => void
}

export default function CreateMovieModal({ onClose, onSuccess }: Props) {
  const id = useId()
  const toast = useToast()
  const client = useQueryClient()
  const [uploads, setUploads] = useState({ poster: false, backdrop: false })
  const [imagesTouched, setImagesTouched] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<MovieFormInput, unknown, MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: movieFormDefaults,
  })
  const cast = useFieldArray({ control, name: 'cast' })
  const creation = useMutation({
    mutationFn: moviesService.create,
    retry: false,
  })
  const uploading = uploads.poster || uploads.backdrop

  const submit = handleSubmit(async values => {
    if (uploading || creation.isPending) return
    const movieId = await creation.mutateAsync(toCreateMovieRequest(values))
    void invalidateMovieQueries(client)
    toast.success(`Фільм «${values.title}» створено`)
    onSuccess(movieId, values.title)
    onClose()
  })

  return (
    <FormDialog
      isOpen
      noValidate
      onClose={onClose}
      onSubmit={submit}
      title='Додати фільм'
      description='Створіть картку для каталогу. Зірочкою позначено обов’язкові поля.'
      confirmText='Створити фільм'
      className='max-w-3xl'
      isDirty={isDirty || imagesTouched}
      isBusy={creation.isPending || isSubmitting}
      submitDisabled={uploading}
    >
      <section className='space-y-4' aria-labelledby={`${id}-general`}>
        <h3 id={`${id}-general`} className='text-base font-medium'>
          Загальна інформація
        </h3>
        <Input
          label='Назва *'
          maxLength={200}
          error={errors.title?.message}
          {...register('title')}
        />
        <div className='space-y-2'>
          <label htmlFor={`${id}-description`} className='field-label'>
            Опис *
          </label>
          <textarea
            id={`${id}-description`}
            rows={3}
            maxLength={2000}
            className='field resize-y'
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? `${id}-description-error` : undefined
            }
            {...register('description')}
          />
          {errors.description && (
            <p
              id={`${id}-description-error`}
              role='alert'
              className='field-error'
            >
              {errors.description.message}
            </p>
          )}
        </div>
        <div className='grid grid-cols-3 gap-4'>
          <Input
            label='Тривалість, хв *'
            type='number'
            min={1}
            max={600}
            step={1}
            error={errors.durationMinutes?.message}
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          <Input
            label='Рік випуску *'
            type='number'
            min={1888}
            max={maximumReleaseYear()}
            step={1}
            error={errors.releaseYear?.message}
            {...register('releaseYear', { valueAsNumber: true })}
          />
          <div className='space-y-2'>
            <label htmlFor={`${id}-status`} className='field-label'>
              Статус *
            </label>
            <select
              id={`${id}-status`}
              className='field'
              {...register('status', { valueAsNumber: true })}
            >
              <option value={1}>Скоро у кіно</option>
              <option value={2}>У прокаті</option>
              <option value={3}>Архів</option>
            </select>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label htmlFor={`${id}-age`} className='field-label'>
              Вікове обмеження
            </label>
            <select
              id={`${id}-age`}
              className='field'
              {...register('ageRestriction')}
            >
              <option value=''>Не вказано</option>
              {movieAgeRestrictions.map(age => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>
          <Input
            label='Рейтинг'
            type='number'
            min={0}
            max={10}
            step='any'
            hint='Від 0 до 10 · до двох знаків після крапки'
            error={errors.rating?.message}
            {...register('rating', {
              setValueAs: value => (value === '' ? undefined : Number(value)),
            })}
          />
        </div>
      </section>
      <div className='border-t border-[var(--border-default)] pt-5'>
        <Controller
          control={control}
          name='genreIds'
          render={({ field }) => (
            <MovieGenreSelect
              value={field.value}
              onChange={field.onChange}
              error={errors.genreIds?.message}
            />
          )}
        />
      </div>
      <section
        className='space-y-4 border-t border-[var(--border-default)] pt-5'
        aria-labelledby={`${id}-images`}
      >
        <h3 id={`${id}-images`} className='text-base font-medium'>
          Зображення
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          {(['poster', 'backdrop'] as const).map(kind => (
            <Controller
              key={kind}
              control={control}
              name={kind}
              render={({ field }) => (
                <MovieImageUpload
                  kind={kind}
                  image={field.value}
                  onChange={field.onChange}
                  onInteract={() => setImagesTouched(true)}
                  onPendingChange={pending =>
                    setUploads(previous => ({ ...previous, [kind]: pending }))
                  }
                />
              )}
            />
          ))}
        </div>
        <p className='field-hint'>
          Зображення необов’язкові. Завантажені файли зберігаються на сервері
          навіть після скасування форми.
        </p>
        {uploading && (
          <output className='field-hint'>
            Дочекайтеся завершення завантаження, щоб створити фільм.
          </output>
        )}
      </section>
      <section
        className='space-y-4 border-t border-[var(--border-default)] pt-5'
        aria-labelledby={`${id}-media`}
      >
        <h3 id={`${id}-media`} className='text-base font-medium'>
          Медіа та акторський склад
        </h3>
        <Input
          label='Посилання на трейлер'
          type='url'
          placeholder='https://www.youtube.com/watch?v=…'
          maxLength={500}
          error={errors.trailerUrl?.message}
          {...register('trailerUrl')}
        />
        {cast.fields.map((member, index) => (
          <div
            key={member.id}
            className='grid grid-cols-[1fr_1fr_auto] items-start gap-3'
          >
            <Input
              label={`Ім’я ${index + 1}`}
              maxLength={200}
              error={errors.cast?.[index]?.name?.message}
              {...register(`cast.${index}.name`)}
            />
            <Input
              label={`Роль ${index + 1}`}
              maxLength={200}
              error={errors.cast?.[index]?.role?.message}
              {...register(`cast.${index}.role`)}
            />
            <Button
              variant='ghost'
              className='mt-7 w-11 px-0'
              aria-label={`Прибрати учасника ${index + 1}`}
              onClick={() => cast.remove(index)}
            >
              <Trash2 size={16} aria-hidden='true' />
            </Button>
          </div>
        ))}
        {(errors.cast?.root?.message || errors.cast?.message) && (
          <p role='alert' className='field-error'>
            {errors.cast.root?.message ?? errors.cast.message}
          </p>
        )}
        <Button
          variant='secondary'
          disabled={cast.fields.length >= 50}
          onClick={() => cast.append({ name: '', role: '' })}
        >
          <Plus size={16} aria-hidden='true' />
          Додати учасника
        </Button>
        <p className='field-hint'>До 50 учасників. Роль можна не вказувати.</p>
      </section>
    </FormDialog>
  )
}
