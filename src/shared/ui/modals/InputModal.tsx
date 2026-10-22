import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Input from '@/shared/ui/Input'

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

  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

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

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 relative'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors'
        >
          <X size={20} />
        </button>

        <h2 className='text-xl font-bold text-white mb-6'>{title}</h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <Input
            type={type}
            label={label}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors'
            >
              Скасувати
            </button>
            <button
              type='submit'
              disabled={isSubmitting || !value.trim()}
              className='flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting && <Loader2 size={16} className='animate-spin' />}
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InputModal
