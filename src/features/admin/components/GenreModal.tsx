import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import Input from '../../../common/components/Input'
import { type Genre } from '../../../services/genresService'

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    externalId: number,
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
  const [externalId, setExternalId] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setExternalId(initialData.externalId.toString())
      setName(initialData.name)
    } else {
      setExternalId('')
      setName('')
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!externalId || !name) return

    setIsSubmitting(true)
    const result = await onSave(Number(externalId), name)
    setIsSubmitting(false)

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

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <Input
            label='TMDB ID (External ID)'
            value={externalId}
            onChange={e => setExternalId(e.target.value)}
            type='number'
            disabled={isEditing}
            placeholder='Напр. 28 (Action)'
          />

          <Input
            label='Назва'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Напр. Action'
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
