import { useState } from 'react'
import { X } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import Input from '../../../common/components/Input'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<{ success: boolean; error?: string }>
}

const PricingModal = ({ isOpen, onClose, onSave }: PricingModalProps) => {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsSubmitting(true)
    const result = await onSave(name)
    setIsSubmitting(false)

    if (result.success) {
      setName('')
      onClose()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'>
      <div className='w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl'>
        <div className='flex items-center justify-between border-b border-white/10 p-6'>
          <h2 className='text-xl font-bold text-white'>Новий тариф</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <Input
            label='Назва тарифу'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Напр. "Стандартний Вечірній"'
            autoFocus
          />

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors'
            >
              Скасувати
            </button>
            <button
              type='submit'
              disabled={isSubmitting || !name.trim()}
              className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg disabled:opacity-50'
            >
              {isSubmitting && (
                <GridLoader className='animate-spin' size={16} />
              )}
              Створити
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PricingModal
