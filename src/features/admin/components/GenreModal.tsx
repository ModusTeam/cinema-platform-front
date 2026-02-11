import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import Input from '../../../common/components/Input'
import { type Genre } from '../../../services/genresService'

const genreSchema = z.object({
  externalId: z.union([z.string(), z.number(), z.null()]).transform(val => {
    if (val === '' || val === null) return null
    const parsed = Number(val)
    return isNaN(parsed) ? null : parsed
  }),
  name: z.string().min(1, "Назва обов'язкова"),
})

type GenreFormInput = {
  externalId: string | number | null
  name: string
}

type GenreFormOutput = z.infer<typeof genreSchema>

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    externalId: number | null,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>
  initialData?: Genre | null
}

const GenreModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: GenreModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GenreFormInput, any, GenreFormOutput>({
    resolver: zodResolver(genreSchema),
    defaultValues: {
      externalId: '',
      name: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        externalId: initialData?.externalId?.toString() ?? '',
        name: initialData?.name || '',
      })
    }
  }, [initialData, isOpen, reset])

  const onSubmit = async (data: GenreFormOutput) => {
    const result = await onSave(data.externalId, data.name)

    if (result.success) {
      onClose()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) return null

  const isEditing = !!initialData

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'>
      <div className='w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between border-b border-white/10 p-6'>
          <h2 className='text-xl font-bold text-white'>
            {isEditing ? 'Редагувати жанр' : 'Новий жанр'}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
          <div className='space-y-1'>
            <Input
              label='TMDB ID (External ID)'
              {...register('externalId')}
              type='number'
              disabled={isEditing}
              placeholder='Залиште пустим для власного жанру'
              error={errors.externalId?.message}
            />
            {!isEditing && (
              <p className='text-xs text-zinc-500'>
                Вкажіть ID з TMDB або залиште пустим, щоб створити локальний
                жанр.
              </p>
            )}
          </div>

          <Input
            label='Назва'
            {...register('name')}
            placeholder='Напр. Action'
            error={errors.name?.message}
          />

          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors'
            >
              Скасувати
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg disabled:opacity-50'
            >
              {isSubmitting && (
                <GridLoader className='animate-spin' size={16} />
              )}
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GenreModal
