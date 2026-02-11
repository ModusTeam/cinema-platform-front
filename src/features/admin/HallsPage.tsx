import { useState } from 'react'
import HallBuilder from '../../features/admin/components/HallBuilder'
import { useHalls } from './hooks/useHalls'
import { useHallEditor } from './hooks/useHallEditor'
import {
  Armchair,
  Trash2,
  Plus,
  Users,
  MonitorPlay,
  Pencil,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import ConfirmModal from '../../common/components/Modals/ConfirmModal'
import InputModal from '../../common/components/Modals/InputModal'
import { useToast } from '../../common/components/Toast/ToastContext'

const HallsPage = () => {
  const toast = useToast()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingHallId, setEditingHallId] = useState<string | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [tempSaveData, setTempSaveData] = useState<any>(null)

  const { halls, isLoading, deleteHall } = useHalls()
  const {
    initialSeats,
    isLoadingData: isLoadingEditData,
    isProcessing: isProcessingSeats,
    loadHallSeats,
    saveHall,
    resetEditor,
    initialTechnologies,
  } = useHallEditor()

  const handleEditClick = async (hallId: string) => {
    setEditingHallId(hallId)
    setMode('edit')
    const success = await loadHallSeats(hallId)
    if (!success) {
      toast.error('Помилка завантаження даних залу')
      setMode('list')
    }
  }

  const handleCreateClick = () => {
    setMode('create')
    setEditingHallId(null)
    resetEditor()
  }

  const handleBackToList = () => {
    setMode('list')
    setEditingHallId(null)
    resetEditor()
  }

  const onSaveClick = (data: any) => {
    if (mode === 'list') return
    setTempSaveData(data)
    setSaveModalOpen(true)
  }

  const onConfirmSave = async (hallName: string) => {
    if (mode === 'list') return
    const result = await saveHall(mode, editingHallId, hallName, tempSaveData)

    if (result.success) {
      toast.success(
        mode === 'create' ? 'Зал успішно створено!' : 'Зал оновлено!',
      )
      handleBackToList()
    } else {
      toast.error(`Помилка: ${result.error}`)
    }
    setSaveModalOpen(false)
    setTempSaveData(null)
  }

  const onDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const onConfirmDelete = async () => {
    if (!deleteId) return
    const success = await deleteHall(deleteId)
    if (success) {
      toast.success('Зал видалено')
    } else {
      toast.error('Не вдалося видалити зал.')
    }
    setDeleteId(null)
  }

  const getCurrentHallName = () => {
    if (mode === 'edit' && editingHallId) {
      return halls.find(h => h.id === editingHallId)?.name || ''
    }
    return ''
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Управління залами</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Створюйте схеми залів та керуйте місцями
          </p>
        </div>

        <button
          type='button'
          onClick={mode === 'list' ? handleCreateClick : handleBackToList}
          className={`rounded-xl px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 ${
            mode !== 'list'
              ? 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white border border-white/10'
              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20'
          }`}
        >
          {mode !== 'list' ? (
            'Скасувати'
          ) : (
            <>
              <Plus size={18} /> Створити новий зал
            </>
          )}
        </button>
      </div>

      {isProcessingSeats && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
          <div className='text-center'>
            <GridLoader className='h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4' />
            <p className='text-white font-medium'>
              Застосування конфігурації місць...
            </p>
          </div>
        </div>
      )}

      {mode !== 'list' ? (
        isLoadingEditData ? (
          <div className='flex justify-center py-20'>
            <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
          </div>
        ) : (
          <div className='animate-in fade-in slide-in-from-top-4'>
            <h2 className='text-xl font-bold text-white mb-4'>
              {mode === 'edit' ? 'Редагування залу' : 'Створення нового залу'}
            </h2>
            <HallBuilder
              onSave={onSaveClick}
              initialSeats={initialSeats}
              initialTechnologies={initialTechnologies}
              isEditing={mode === 'edit'}
            />
          </div>
        )
      ) : (
        <>
          {isLoading && (
            <div className='flex justify-center py-20'>
              <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
            </div>
          )}

          {!isLoading && halls.length === 0 && (
            <div className='rounded-xl border border-dashed border-white/10 bg-[var(--bg-card)]/50 p-12 text-center text-[var(--text-muted)]'>
              <Armchair className='mx-auto h-12 w-12 mb-4 opacity-50' />
              Немає залів
            </div>
          )}

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {halls.map(hall => (
              <div
                key={hall.id}
                className='group relative overflow-hidden rounded-xl border border-white/5 bg-[var(--bg-card)] transition-all hover:border-[var(--color-primary)]/30 hover:shadow-lg'
              >
                <div className='p-6'>
                  <div className='flex items-start justify-between mb-6'>
                    <div className='rounded-lg bg-white/5 p-3 text-white group-hover:text-[var(--color-primary)] transition-colors'>
                      <MonitorPlay size={24} />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEditClick(hall.id)}
                        className='rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition-colors'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type='button'
                        onClick={() => onDeleteClick(hall.id)}
                        className='rounded p-2 text-[var(--text-muted)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>
                    {hall.name}
                  </h3>
                  <div className='flex items-center gap-2 text-[var(--text-muted)] text-sm'>
                    <Users size={16} />{' '}
                    <span>
                      Місць:{' '}
                      <span className='text-white font-medium'>
                        {hall.capacity}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title='Видалити зал?'
        message='Ви впевнені, що хочете видалити цей зал? Це призведе до видалення всіх місць та конфігурації. Дія незворотна.'
        isDestructive
        confirmText='Видалити'
      />

      <InputModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSubmit={onConfirmSave}
        title={mode === 'edit' ? 'Оновлення залу' : 'Збереження залу'}
        label='Назва залу'
        placeholder='Наприклад: Зал 1 (IMAX)'
        initialValue={getCurrentHallName()}
        confirmText='Зберегти'
      />
    </div>
  )
}

export default HallsPage
