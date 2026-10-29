import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { moviesService } from '@/entities/movie/api/movies.service'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import Input from '@/shared/ui/Input'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'
import { buildMovieUpdate, type MovieEditValues } from '../lib/movieEdit'
import { movieFormSchema } from '../model/movieForm.schema'
import { invalidateMovieQueries } from '../model/movieQueries'
import { MovieImageUpload } from './MovieImageUpload'

interface Props {
  isOpen: boolean
  movie: Movie | null
  onClose: () => void
  onSuccess: () => void
}

const editSchema = movieFormSchema
  .pick({
    title: true,
    description: true,
    status: true,
    trailerUrl: true,
    poster: true,
    backdrop: true,
  })
  .extend({
    description: z.string().trim().max(2000, 'Не більше 2000 символів'),
  })

function EditMovieForm({
  movie,
  onClose,
  onSuccess,
}: {
  movie: Movie
  onClose: () => void
  onSuccess: () => void
}) {
  const id = useId()
  const toast = useToast()
  const client = useQueryClient()
  const details = useQuery({
    queryKey: ['admin-movie-details', movie.id],
    queryFn: ({ signal }) => moviesService.getDetails(movie.id, signal),
    staleTime: 0,
    gcTime: 0,
  })
  const initialized = useRef(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [uploads, setUploads] = useState({ poster: false, backdrop: false })
  const [touched, setTouched] = useState({ poster: false, backdrop: false })
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const pendingValues = useRef<MovieEditValues | null>(null)
  const {
    register,
    control,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof editSchema>, unknown, MovieEditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: '',
      description: '',
      status: MovieStatus.Active,
      trailerUrl: '',
      poster: null,
      backdrop: null,
    },
  })
  useEffect(() => {
    if (!details.data || initialized.current) return
    const data = details.data
    initialized.current = true
    reset({
      title: data.title,
      description: data.description ?? '',
      status: data.status as MovieStatus,
      trailerUrl: data.trailerUrl ?? '',
      poster:
        data.posterUrl && data.posterPublicId
          ? { secureUrl: data.posterUrl, publicId: data.posterPublicId }
          : null,
      backdrop:
        data.backdropUrl && data.backdropPublicId
          ? { secureUrl: data.backdropUrl, publicId: data.backdropPublicId }
          : null,
    })
  }, [details.data, reset])

  const save = async (values: MovieEditValues) => {
    if (
      !details.data ||
      savingRef.current ||
      uploads.poster ||
      uploads.backdrop
    )
      return
    savingRef.current = true
    setSaving(true)
    try {
      await moviesService.update(
        movie.id,
        buildMovieUpdate(details.data, values, touched),
      )
      toast.success('Фільм успішно оновлено')
      onSuccess()
      onClose()
    } finally {
      void invalidateMovieQueries(client)
      void client.invalidateQueries({
        queryKey: ['admin-movie-details', movie.id],
        refetchType: 'none',
      })
      savingRef.current = false
      setSaving(false)
    }
  }
  const submit = handleSubmit(async values => {
    if (!details.data) return
    if (!values.description && details.data.description?.trim()) {
      setError(
        'description',
        { message: 'Додайте опис' },
        { shouldFocus: true },
      )
      return
    }
    if (
      values.status === MovieStatus.Archived &&
      details.data.status !== MovieStatus.Archived
    ) {
      pendingValues.current = values
      setConfirmArchive(true)
      return
    }
    await save(values)
  })

  return (
    <>
      <FormDialog
        isOpen
        noValidate
        onClose={onClose}
        onSubmit={submit}
        title='Редагувати фільм'
        description={movie.title}
        className='max-w-3xl'
        isBusy={saving}
        isDirty={isDirty || touched.poster || touched.backdrop}
        submitDisabled={
          !initialized.current ||
          details.isError ||
          uploads.poster ||
          uploads.backdrop
        }
      >
        {details.isPending ? (
          <output>Завантаження фільму…</output>
        ) : details.isError ? (
          <UnavailableState
            title='Не вдалося завантажити фільм'
            onRetry={() => void details.refetch()}
          />
        ) : (
          <>
            <div className='grid grid-cols-[2fr_1fr] gap-4'>
              <Input
                label='Назва'
                maxLength={200}
                error={errors.title?.message}
                {...register('title')}
              />
              <div className='space-y-2'>
                <label htmlFor={`${id}-status`} className='field-label'>
                  Статус
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
            <div className='space-y-2'>
              <label htmlFor={`${id}-description`} className='field-label'>
                Опис
              </label>
              <textarea
                id={`${id}-description`}
                rows={4}
                maxLength={2000}
                className='field'
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
            <div className='grid grid-cols-2 gap-4 border-t border-[var(--border-default)] pt-5'>
              {(['poster', 'backdrop'] as const).map(kind => (
                <Controller
                  key={kind}
                  control={control}
                  name={kind}
                  render={({ field }) => (
                    <MovieImageUpload
                      kind={kind}
                      image={
                        touched[kind]
                          ? field.value
                          : details.data[`${kind}Url`]
                            ? {
                                secureUrl: details.data[`${kind}Url`] as string,
                              }
                            : null
                      }
                      onChange={field.onChange}
                      onInteract={() =>
                        setTouched(previous => ({ ...previous, [kind]: true }))
                      }
                      onPendingChange={pending =>
                        setUploads(previous => ({
                          ...previous,
                          [kind]: pending,
                        }))
                      }
                    />
                  )}
                />
              ))}
            </div>
            <Input
              label='Посилання на трейлер'
              type='url'
              maxLength={500}
              error={errors.trailerUrl?.message}
              {...register('trailerUrl')}
            />
          </>
        )}
      </FormDialog>
      <ConfirmModal
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={async () => {
          if (pendingValues.current) await save(pendingValues.current)
        }}
        title='Архівувати фільм?'
        message={`Зберегти зміни й перевести фільм «${movie.title}» до архіву?`}
        confirmText='Зберегти й архівувати'
        isLoading={saving}
      />
    </>
  )
}

export default function EditMovieModal({
  isOpen,
  movie,
  onClose,
  onSuccess,
}: Props) {
  return isOpen && movie ? (
    <EditMovieForm
      key={movie.id}
      movie={movie}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  ) : null
}
