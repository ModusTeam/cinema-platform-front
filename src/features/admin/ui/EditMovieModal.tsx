import { useEffect, useId, useState } from 'react'
import { moviesService } from '@/entities/movie/api/movies.service'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import Input from '@/shared/ui/Input'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
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
  const [confirmArchive, setConfirmArchive] = useState(false)
  const fieldId = useId()

  useEffect(() => {
    if (isOpen && movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl,
        videoUrl: movie.videoUrl || '',
        status: movie.status || MovieStatus.Active,
      })
    }
  }, [movie, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movie || isSaving) return
    if (
      formData.status === MovieStatus.Archived &&
      movie.status !== MovieStatus.Archived
    ) {
      setConfirmArchive(true)
      return
    }
    await saveMovie()
  }

  const saveMovie = async () => {
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
      setConfirmArchive(false)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !movie) return null

  return (
    <>
      <FormDialog
        isOpen={isOpen}
        onClose={onClose}
        title='Редагувати фільм'
        description={movie.title}
        isBusy={isSaving}
        className='max-w-2xl'
        onSubmit={handleSubmit}
        isDirty={
          formData.title !== movie.title ||
          formData.description !== movie.description ||
          formData.posterUrl !== (movie.posterUrl || '') ||
          formData.backdropUrl !== movie.backdropUrl ||
          formData.videoUrl !== (movie.videoUrl || '') ||
          formData.status !== (movie.status || MovieStatus.Active)
        }
      >
        <div className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4'>
          <Input
            label='Назва'
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
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
          onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
        />
      </FormDialog>
      <ConfirmModal
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={saveMovie}
        title='Архівувати фільм?'
        message={`Зберегти зміни й перевести фільм «${movie.title}» до архіву?`}
        confirmText='Зберегти й архівувати'
        isLoading={isSaving}
      />
    </>
  )
}

export default EditMovieModal
