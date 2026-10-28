import {
  Armchair,
  MonitorPlay,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import type {
  HallBuilderData,
  HallSaveScope,
} from '@/features/admin/model/hallBuilder.types'
import { useHallEditor } from '@/features/admin/model/useHallEditor'
import { useHalls } from '@/features/admin/model/useHalls'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import HallBuilder from '@/features/admin/ui/HallBuilder'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import InputModal from '@/shared/ui/modals/InputModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const HallsPage = () => {
  const toast = useToast()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingHallId, setEditingHallId] = useState<string | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [tempSaveData, setTempSaveData] = useState<HallBuilderData | null>(null)
  const [saveScope, setSaveScope] = useState<HallSaveScope>('all')

  const { halls, isLoading, isError, refetch, deleteHall } = useHalls()
  const {
    initialHall,
    layoutLocked,
    isLoadingData: isLoadingEditData,
    loadHallSeats,
    saveHall,
    resetEditor,
  } = useHallEditor()

  const handleEditClick = async (hallId: string) => {
    setEditingHallId(hallId)
    setMode('edit')
    const success = await loadHallSeats(hallId)
    if (success === false) {
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

  const onSaveClick = (data: HallBuilderData, scope: HallSaveScope) => {
    if (mode === 'list') return
    setTempSaveData(data)
    setSaveScope(scope)
    setSaveModalOpen(true)
  }

  const onConfirmSave = async (hallName: string) => {
    if (mode === 'list' || !tempSaveData) return
    const result = await saveHall(
      mode,
      editingHallId,
      hallName,
      tempSaveData,
      saveScope,
    )

    if (result.success) {
      toast.success(
        mode === 'create'
          ? 'Зал успішно створено!'
          : saveScope === 'metadata'
            ? 'Назву й технології збережено. Схема залишилася в редакторі.'
            : 'Зал оновлено!',
      )
      if (saveScope === 'all') handleBackToList()
    } else {
      throw new Error(result.error || 'Не вдалося зберегти зал')
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
      throw new Error('Не вдалося видалити зал. Спробуйте ще раз.')
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
      <AdminPageHeader
        title='Управління залами'
        description='Створюйте схеми залів та керуйте місцями'
      >
        <Button
          type='button'
          onClick={mode === 'list' ? handleCreateClick : handleBackToList}
          variant={mode === 'list' ? 'primary' : 'secondary'}
          className='px-6 py-3'
        >
          {mode !== 'list' ? (
            'Скасувати'
          ) : (
            <>
              <Plus size={18} /> Створити новий зал
            </>
          )}
        </Button>
      </AdminPageHeader>

      {mode !== 'list' ? (
        isLoadingEditData ? (
          <div className='flex justify-center py-20'>
            <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
          </div>
        ) : (
          <div className='animate-in fade-in slide-in-from-top-4'>
            <h2 className='type-section text-white mb-4'>
              {mode === 'edit' ? 'Редагування залу' : 'Створення нового залу'}
            </h2>
            <HallBuilder
              key={editingHallId ?? 'new'}
              onSave={onSaveClick}
              initialSeats={initialHall?.seats}
              initialTechnologies={initialHall?.technologies}
              isEditing={mode === 'edit'}
              layoutLocked={layoutLocked}
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

          {!isLoading && isError && halls.length === 0 && (
            <UnavailableState onRetry={() => void refetch()} />
          )}

          {!isLoading && !isError && halls.length === 0 && (
            <EmptyState
              icon={<Armchair className='h-12 w-12' />}
              title='Залів ще немає'
              description='Створіть перший зал зі схемою місць, щоб можна було планувати сеанси.'
              actionLabel='Створити зал'
              onAction={handleCreateClick}
            />
          )}

          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {halls.map(hall => (
              <div
                key={hall.id}
                className='group relative min-w-0 overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-muted)]'
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
                        aria-label={`Редагувати зал ${hall.name}`}
                        className='rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition-colors'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type='button'
                        onClick={() => onDeleteClick(hall.id)}
                        aria-label={`Видалити зал ${hall.name}`}
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
        message={`Зал «${halls.find(hall => hall.id === deleteId)?.name ?? ''}» та його конфігурацію буде видалено. Дія незворотна.`}
        isDestructive
        confirmText='Видалити'
      />

      <InputModal
        closeOnSubmit={false}
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSubmit={onConfirmSave}
        title={
          mode === 'edit'
            ? saveScope === 'metadata'
              ? 'Збереження назви й технологій'
              : 'Оновлення залу'
            : 'Збереження залу'
        }
        label='Назва залу'
        placeholder='Наприклад: Зал 1 (IMAX)'
        initialValue={getCurrentHallName()}
        confirmText='Зберегти'
      />
    </div>
  )
}

export default HallsPage
