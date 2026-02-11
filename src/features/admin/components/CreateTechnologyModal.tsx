import { useState } from 'react'
import { X } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import Input from '../../../common/components/Input'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsSubmitting(true)
    const result = await onSubmit(name, type)
    setIsSubmitting(false)

    if (result.success) {
      setName('')
      setType('Visual')
      onClose()
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'>
      <div className='w-full max-w-md bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between border-b border-white/10 p-6'>
          <h2 className='text-xl font-bold text-white'>Нова технологія</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <Input
            label='Назва (напр. IMAX, D-Box)'
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1'>
              Тип
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className='w-full rounded-xl border border-white/10 bg-[var(--bg-main)] px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] appearance-none cursor-pointer'
            >
              <option value='Visual'>Visual (Зображення)</option>
              <option value='Audio'>Audio (Звук)</option>
              <option value='Seating'>Seating (Крісла)</option>
              <option value='Experience'>Experience (Ефекти)</option>
            </select>
          </div>

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
              Створити
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTechnologyModal
