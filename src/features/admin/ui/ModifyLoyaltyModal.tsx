import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Input from '@/shared/ui/Input'
import { FormDialog } from '@/shared/ui/modals/FormDialog'

const modifySchema = z.object({
  action: z.enum(['add', 'deduct']),
  points: z.number().min(1, 'Мінімум 1 бал'),
  reason: z.string().min(5, 'Мінімум 5 символів'),
})
type ModifyFormData = z.infer<typeof modifySchema>
interface ModifyLoyaltyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (points: number, reason: string) => Promise<void>
  userName: string
}
const ModifyLoyaltyModal = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
}: ModifyLoyaltyModalProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ModifyFormData>({
    resolver: zodResolver(modifySchema),
    defaultValues: { action: 'add', points: 0, reason: '' },
  })
  useEffect(() => {
    if (isOpen) reset({ action: 'add', points: 0, reason: '' })
  }, [isOpen, reset])
  const action = watch('action')
  const points = watch('points')
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title='Зміна балансу'
      description={userName}
      isDirty={isDirty}
      confirmText={
        action === 'add' ? 'Підтвердити нарахування' : 'Підтвердити списання'
      }
      onSubmit={handleSubmit(async data => {
        await onSubmit(
          data.action === 'add' ? data.points : -data.points,
          data.reason,
        )
        onClose()
      })}
    >
      <fieldset className='flex flex-wrap gap-4'>
        <legend className='field-label mb-3'>Операція</legend>
        <label className='flex min-h-11 items-center gap-2 text-sm'>
          <input
            type='radio'
            className='h-4 w-4 accent-[var(--action-primary)]'
            value='add'
            {...register('action')}
          />
          Нарахувати
        </label>
        <label className='flex min-h-11 items-center gap-2 text-sm'>
          <input
            type='radio'
            className='h-4 w-4 accent-[var(--action-primary)]'
            value='deduct'
            {...register('action')}
          />
          Списати
        </label>
      </fieldset>
      <Input
        label='Кількість балів'
        type='number'
        placeholder='Наприклад: 100'
        error={errors.points?.message}
        {...register('points', { valueAsNumber: true })}
      />
      <Input
        label='Причина'
        placeholder='Опишіть причину зміни балансу'
        error={errors.reason?.message}
        {...register('reason')}
      />
      <p className='border-t border-[var(--border-default)] pt-4 text-sm leading-relaxed text-[var(--text-muted)]'>
        {action === 'add' ? 'Нарахування' : 'Списання'}:{' '}
        {Number.isFinite(points) ? points : '—'} балів. Зміна вплине на реальний
        баланс користувача. Перевірте суму та причину перед підтвердженням.
      </p>
    </FormDialog>
  )
}
export default ModifyLoyaltyModal
