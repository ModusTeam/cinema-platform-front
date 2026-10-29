import { ImagePlus, Loader2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { moviesService } from '@/entities/movie/api/movies.service'
import type {
  MovieImageKind,
  MovieImageReference,
  MovieImageUploadResult,
} from '@/entities/movie/model/movie.types'
import Button from '@/shared/ui/Button'
import {
  formatImageBytes,
  movieImageAccept,
  validateMovieImage,
} from '../lib/movieImageUpload'

interface Props {
  kind: MovieImageKind
  image: { secureUrl: string } | null
  onChange: (image: MovieImageReference | null) => void
  onPendingChange: (pending: boolean) => void
  onInteract: () => void
}

export function MovieImageUpload({
  kind,
  image,
  onChange,
  onPendingChange,
  onInteract,
}: Props) {
  const id = useId()
  const title = kind === 'poster' ? 'Постер' : 'Фонове зображення'
  const input = useRef<HTMLInputElement>(null)
  const request = useRef<AbortController | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState<MovieImageUploadResult | null>(null)

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const upload = async (selected: File) => {
    if (request.current) return
    const validationError = validateMovieImage(selected)
    setError(validationError ?? '')
    if (validationError) return
    onInteract()
    setFile(selected)
    setUploaded(null)
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    onPendingChange(true)
    try {
      const result = await moviesService.uploadImage(
        selected,
        kind,
        controller.signal,
      )
      if (controller.signal.aborted) return
      setUploaded(result)
      onChange({ secureUrl: result.secureUrl, publicId: result.publicId })
      // The remote image replaces the temporary local preview after upload.
      setFile(null)
    } catch (failure) {
      if (controller.signal.aborted) return
      setError(
        failure instanceof Error
          ? failure.message
          : 'Не вдалося завантажити зображення. Спробуйте ще раз.',
      )
    } finally {
      if (!controller.signal.aborted) {
        setPending(false)
        onPendingChange(false)
      }
      request.current = null
    }
  }

  const remove = () => {
    onInteract()
    setFile(null)
    setUploaded(null)
    setError('')
    onChange(null)
  }
  const source = (error ? '' : preview) || image?.secureUrl

  return (
    <div className='min-w-0 space-y-3'>
      <label htmlFor={id} className='field-label'>
        {title}
      </label>
      <div className='flex min-h-36 items-center gap-4 border border-[var(--border-default)] bg-[var(--bg-card)] p-3'>
        <div
          className={
            kind === 'poster'
              ? 'h-32 w-[86px] shrink-0 overflow-hidden bg-[var(--surface-muted)]'
              : 'h-24 w-36 shrink-0 overflow-hidden bg-[var(--surface-muted)]'
          }
        >
          {source ? (
            <img
              src={source}
              alt={`Попередній перегляд: ${title.toLowerCase()}`}
              className='h-full w-full object-contain'
            />
          ) : (
            <div className='flex h-full items-center justify-center text-[var(--text-faint)]'>
              <ImagePlus size={24} aria-hidden='true' />
            </div>
          )}
        </div>
        <div className='min-w-0 space-y-2 text-xs text-[var(--text-muted)]'>
          <p id={`${id}-hint`}>JPEG, PNG або WebP · до 10 МіБ</p>
          <input
            ref={input}
            id={id}
            type='file'
            tabIndex={-1}
            accept={movieImageAccept}
            disabled={pending}
            className='sr-only'
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
            aria-invalid={!!error}
            onChange={event => {
              const selected = event.target.files?.[0]
              event.target.value = ''
              if (selected) void upload(selected)
            }}
          />
          <Button
            variant='secondary'
            disabled={pending}
            onClick={() => input.current?.click()}
            aria-label={`${source ? 'Замінити' : 'Завантажити'}: ${title.toLowerCase()}`}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
            className='px-3 text-xs'
          >
            {source ? 'Замінити' : 'Вибрати файл'}
          </Button>
          {(source || file) && (
            <Button
              variant='ghost'
              disabled={pending}
              onClick={remove}
              aria-label={`Прибрати: ${title.toLowerCase()}`}
              className='px-2 text-xs'
            >
              Прибрати
            </Button>
          )}
          <output aria-live='polite' className='block'>
            {pending ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2
                  size={14}
                  aria-hidden='true'
                  className='animate-spin motion-reduce:animate-none'
                />
                Завантаження…
              </span>
            ) : uploaded ? (
              <>
                <span className='block text-[var(--color-success)]'>
                  Завантажено
                </span>
                <span className='mt-1 block tabular-nums'>
                  {uploaded.width} × {uploaded.height} ·{' '}
                  {formatImageBytes(uploaded.bytes)}
                </span>
              </>
            ) : null}
          </output>
        </div>
      </div>
      {error && (
        <div>
          <p
            id={`${id}-error`}
            role='alert'
            className='field-error break-words'
          >
            {error}
          </p>
          <p className='field-hint'>
            Новий файл не прикріплено. Попередній вибір збережено.
          </p>
          {file && (
            <Button
              variant='ghost'
              onClick={() => void upload(file)}
              disabled={pending}
              className='mt-1 text-xs'
            >
              Повторити завантаження
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
