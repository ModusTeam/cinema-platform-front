import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { moviesService } from '@/entities/movie/api/movies.service'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import { GridLoader } from '@/shared/ui/GridLoader'
import Input from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/modals/Dialog'
import { useToast } from '@/shared/ui/toast/ToastContext'

interface EditMovieModalProps {
  isOpen: boolean
  movie: Movie | null
  onClose: () => void
  onSuccess: () => void
}

const EditMovieModal = ({
  isOpen,
  movie,
  onClose,
  onSuccess,
}: EditMovieModalProps) => {
  const toast = useToast()
  const [formData, setFormData] = useState<{
    title: string
    description: string
    posterUrl: string
    backdropUrl: string
    videoUrl: string
    status: MovieStatus
  }>({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '',
    status: MovieStatus.Active,
  })
  const [isSaving, setIsSaving] = useState(false)
  const fieldId = useId()
  const titleId = `${fieldId}-title`

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl,
        videoUrl: movie.videoUrl || '',
        status: movie.status || MovieStatus.Active,
      })
    }
  }, [movie])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movie || isSaving) return

    setIsSaving(true)
    try {
      await moviesService.update(movie.id, {
        ...formData,
        duration: movie.duration,
        rating: movie.rating,
        year: movie.year,
      })
      toast.success('Фільм успішно оновлено')
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Помилка при оновленні фільму')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !movie) return null

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      isBusy={isSaving}
      className='max-w-2xl'
    >
      <div className='flex shrink-0 items-center justify-between border-b border-white/10 p-6'>
        <h2
          id={titleId}
          tabIndex={-1}
          data-modal-initial-focus
          className='text-xl font-bold text-white'
        >
          Редагувати фільм
        </h2>
        <button
          type='button'
          onClick={onClose}
          disabled={isSaving}
          aria-label='Закрити діалог'
          className='text-[var(--text-muted)] hover:text-white'
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='flex min-h-0 flex-col'>
        <div className='min-h-0 overflow-y-auto overscroll-contain p-6 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4'>
            <Input
              label='Назва'
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <div className='space-y-1.5'>
              <label
                htmlFor={`${fieldId}-status`}
                className='text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1'
              >
                Статус
              </label>
              <select
                id={`${fieldId}-status`}
                value={formData.status}
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: Number(e.target.value) as MovieStatus,
                  })
                }
                className='w-full rounded-xl border border-white/10 bg-[var(--bg-main)] px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] appearance-none cursor-pointer'
              >
                <option value={MovieStatus.ComingSoon}>Скоро у кіно</option>
                <option value={MovieStatus.Active}>У прокаті (Active)</option>
                <option value={MovieStatus.Archived}>Архів</option>
              </select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor={`${fieldId}-description`}
              className='text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1'
            >
              Опис
            </label>
            <textarea
              id={`${fieldId}-description`}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='w-full rounded-xl border border-white/10 bg-[var(--bg-main)] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] min-h-[100px]'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Poster URL'
              value={formData.posterUrl}
              onChange={e =>
                setFormData({ ...formData, posterUrl: e.target.value })
              }
            />
            <Input
              label='Backdrop URL'
              value={formData.backdropUrl}
              onChange={e =>
                setFormData({ ...formData, backdropUrl: e.target.value })
              }
            />
          </div>

          <Input
            label='Trailer URL (YouTube)'
            value={formData.videoUrl}
            onChange={e =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
          />
        </div>
        <div className='flex shrink-0 justify-end gap-3 p-6 pt-4 border-t border-white/10'>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='px-6 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors'
          >
            Скасувати
          </button>
          <button
            type='submit'
            disabled={isSaving}
            className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg disabled:opacity-50'
          >
            {isSaving && <GridLoader className='animate-spin' size={16} />}
            Зберегти
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export default EditMovieModal
