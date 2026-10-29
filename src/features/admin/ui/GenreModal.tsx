import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Input from '@/shared/ui/Input'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'
import type { Genre } from '../api/genres.service'

const genreSchema = z.object({
  externalId: z.union([z.string(), z.number(), z.null()]).transform(value => {
    if (value === '' || value === null) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }),
  name: z.string().min(1, "Назва обов'язкова"),
})
type GenreFormInput = z.input<typeof genreSchema>
type GenreFormOutput = z.output<typeof genreSchema>
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
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<GenreFormInput, unknown, GenreFormOutput>({
    resolver: zodResolver(genreSchema),
    defaultValues: { externalId: '', name: '' },
  })
  useEffect(() => {
    if (isOpen)
      reset({
        externalId: initialData?.externalId?.toString() ?? '',
        name: initialData?.name || '',
      })
  }, [initialData, isOpen, reset])
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Редагувати жанр' : 'Новий жанр'}
      isDirty={isDirty}
      onSubmit={handleSubmit(async data => {
        const result = await onSave(data.externalId, data.name)
        if (!result.success)
          throw new Error(result.error || 'Не вдалося зберегти жанр')
        toast.success(initialData ? 'Жанр оновлено' : 'Жанр створено')
        onClose()
      })}
    >
      <Input
        label='TMDB ID (External ID)'
        {...register('externalId')}
        type='number'
        disabled={!!initialData}
        hint={
          initialData
            ? undefined
            : 'Вкажіть ID з TMDB або залиште пустим для власного жанру.'
        }
        error={errors.externalId?.message}
      />
      <Input
        label='Назва'
        {...register('name')}
        placeholder='Напр. Драма'
        error={errors.name?.message}
      />
    </FormDialog>
  )
}
export default GenreModal
