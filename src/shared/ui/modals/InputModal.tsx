import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { Dialog } from './Dialog'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => Promise<void> | void
  closeOnSubmit?: boolean
  title: string
  label?: string
  initialValue?: string
  placeholder?: string
  confirmText?: string
  type?: React.HTMLInputTypeAttribute
}

const InputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  initialValue = '',
  placeholder = '',
  confirmText = 'Зберегти',
  type = 'text',
  closeOnSubmit = true,
}: InputModalProps) => {
  const [value, setValue] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !value.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(value)
      if (closeOnSubmit) onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      isBusy={isSubmitting}
      className='max-w-md p-6 scale-100 motion-reduce:animate-none animate-in zoom-in-95 duration-200 relative'
    >
      <Button
        type='button'
        onClick={onClose}
        disabled={isSubmitting}
        aria-label='Закрити діалог'
        variant='ghost'
        className='absolute top-4 right-4 min-h-0 p-0'
      >
        <X size={20} />
      </Button>

      <h2 id={titleId} className='shrink-0 type-section text-white mb-6 pr-6'>
        {title}
      </h2>

      <form onSubmit={handleSubmit} className='flex min-h-0 flex-col gap-6'>
        <div className='min-h-0 overflow-y-auto overscroll-contain'>
          <Input
            type={type}
            label={label}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label={label ? undefined : title}
            data-modal-initial-focus
            disabled={isSubmitting}
          />
        </div>

        <div className='flex shrink-0 justify-end gap-3'>
          <Button
            type='button'
            onClick={onClose}
            disabled={isSubmitting}
            variant='secondary'
          >
            Скасувати
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting || !value.trim()}
            isLoading={isSubmitting}
          >
            {confirmText}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default InputModal
