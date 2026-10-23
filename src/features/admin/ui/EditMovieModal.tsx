import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { moviesService } from '@/entities/movie/api/movies.service'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import Button from '@/shared/ui/Button'
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
          className='type-section text-white'
        >
          Редагувати фільм
        </h2>
        <Button
          type='button'
          onClick={onClose}
          disabled={isSaving}
          aria-label='Закрити діалог'
          variant='ghost'
          className='min-h-0 p-0'
        >
          <X size={24} />
        </Button>
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

            <div className='space-y-2'>
              <label htmlFor={`${fieldId}-status`} className='field-label'>
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
                className='field'
              >
                <option value={MovieStatus.ComingSoon}>Скоро у кіно</option>
                <option value={MovieStatus.Active}>У прокаті (Active)</option>
                <option value={MovieStatus.Archived}>Архів</option>
              </select>
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor={`${fieldId}-description`} className='field-label'>
              Опис
            </label>
            <textarea
              id={`${fieldId}-description`}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='field'
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
          <Button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            variant='secondary'
          >
            Скасувати
          </Button>
          <Button type='submit' disabled={isSaving} isLoading={isSaving}>
            Зберегти
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default EditMovieModal
