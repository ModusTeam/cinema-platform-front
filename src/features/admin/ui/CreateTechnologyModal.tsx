import { useEffect, useId, useState } from 'react'
import Input from '@/shared/ui/Input'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'

interface CreateTechnologyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    name: string,
    type: string,
  ) => Promise<{ success: boolean; error?: string }>
}
const CreateTechnologyModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateTechnologyModalProps) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('Visual')
  const id = useId()
  const toast = useToast()
  useEffect(() => {
    if (isOpen) {
      setName('')
      setType('Visual')
    }
  }, [isOpen])
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title='Нова технологія'
      confirmText='Створити'
      isDirty={!!name || type !== 'Visual'}
      submitDisabled={!name.trim()}
      onSubmit={async () => {
        const result = await onSubmit(name, type)
        if (!result.success)
          throw new Error(result.error || 'Не вдалося створити технологію')
        toast.success('Технологію створено')
        setName('')
        setType('Visual')
        onClose()
      }}
    >
      <Input
        label='Назва (напр. IMAX, D-Box)'
        value={name}
        onChange={event => setName(event.target.value)}
        required
      />
      <div className='space-y-2'>
        <label htmlFor={id} className='field-label'>
          Тип
        </label>
        <select
          id={id}
          value={type}
          onChange={event => setType(event.target.value)}
          className='field'
        >
          <option value='Visual'>Visual (Зображення)</option>
          <option value='Audio'>Audio (Звук)</option>
          <option value='Seating'>Seating (Крісла)</option>
          <option value='Experience'>Experience (Ефекти)</option>
        </select>
      </div>
    </FormDialog>
  )
}
export default CreateTechnologyModal
