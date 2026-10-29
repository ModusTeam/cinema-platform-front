import { useEffect, useState } from 'react'
import Input from '@/shared/ui/Input'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<{ success: boolean; error?: string }>
}
const PricingModal = ({ isOpen, onClose, onSave }: PricingModalProps) => {
  const [name, setName] = useState('')
  const toast = useToast()
  useEffect(() => {
    if (isOpen) setName('')
  }, [isOpen])
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title='Новий тариф'
      confirmText='Створити'
      isDirty={!!name}
      submitDisabled={!name.trim()}
      onSubmit={async () => {
        const result = await onSave(name)
        if (!result.success)
          throw new Error(result.error || 'Не вдалося створити тариф')
        toast.success('Тариф створено')
        setName('')
        onClose()
      }}
    >
      <Input
        label='Назва тарифу'
        value={name}
        onChange={event => setName(event.target.value)}
        placeholder='Напр. Стандартний вечірній'
        required
      />
    </FormDialog>
  )
}
export default PricingModal
