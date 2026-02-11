import { useState } from 'react'
import { useSessions } from './hooks/useSessions'
import {
  Plus,
  Clock,
  Film,
  MonitorPlay,
  Trash2,
  Edit,
  Calendar,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import CreateSessionModal from './components/CreateSessionModal'
import { type SessionDto } from '../../services/adminSessionsService'
import ConfirmModal from '../../common/components/Modals/ConfirmModal'
import InputModal from '../../common/components/Modals/InputModal'
import { useToast } from '../../common/components/Toast/ToastContext'

const AdminSessionsPage = () => {
  const {
    sessions,
    isLoading,
    fetchSessions,
    deleteSession,
    rescheduleSession,
  } = useSessions()

  const toast = useToast()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [rescheduleData, setRescheduleData] = useState<{
    id: string
    currentStart: string
  } | null>(null)

  const handleDeleteClick = (id: string) => setDeleteId(id)
  const handleRescheduleClick = (id: string, currentStart: string) =>
    setRescheduleData({ id, currentStart })

  const onConfirmDelete = async () => {
    if (!deleteId) return
    const success = await deleteSession(deleteId)
    if (success) {
      toast.success('Сеанс успішно скасовано')
    } else {
      toast.error('Помилка скасування. Можливо, на нього вже є квитки.')
    }
    setDeleteId(null)
  }

  const onConfirmReschedule = async (newTimeStr: string) => {
    if (!rescheduleData) return

    const newDate = new Date(newTimeStr)
    if (isNaN(newDate.getTime())) {
      toast.error('Невірний формат дати')
      return
    }

    const result = await rescheduleSession(
      rescheduleData.id,
      newDate.toISOString(),
    )
    if (result.success) {
      toast.success('Сеанс успішно перенесено')
    } else {
      toast.error('Помилка переносу: ' + result.error)
    }
  }

  const groupedSessions = sessions.reduce(
    (groups, session) => {
      const dateKey = new Date(session.startTime).toDateString()
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(session)
      return groups
    },
    {} as Record<string, SessionDto[]>,
  )

  const getInitialRescheduleValue = () => {
    if (!rescheduleData) return ''
    const date = new Date(rescheduleData.currentStart)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
  }

  return (
    <div className='space-y-8 pb-20'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Розклад сеансів</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Планування та керування показами
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsCreateModalOpen(true)}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> Додати сеанс
        </button>
      </div>

      {isLoading ? (
        <div className='py-20 flex justify-center'>
          <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
        </div>
      ) : (
        <div className='space-y-10 animate-in fade-in slide-in-from-bottom-4'>
          {Object.keys(groupedSessions).length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl bg-[var(--bg-card)]/50'>
              <Calendar className='h-12 w-12 text-[var(--text-muted)] mb-4' />
              <div className='text-xl font-medium text-white'>
                Сеансів не знайдено
              </div>
            </div>
          )}

          {Object.entries(groupedSessions).map(([dateKey, sessionList]) => {
            const dateObj = new Date(sessionList[0].startTime)
            const isToday = dateObj.toDateString() === new Date().toDateString()

            return (
              <div key={dateKey} className='relative'>
                <div className='sticky top-0 z-10 flex items-center gap-4 bg-[var(--bg-main)]/95 py-4 backdrop-blur-md border-b border-white/5 mb-4'>
                  <div
                    className={`text-xl font-bold flex items-center gap-2 ${isToday ? 'text-[var(--color-success)]' : 'text-white'}`}
                  >
                    {dateObj.toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      weekday: 'long',
                    })}
                  </div>
                  {isToday && (
                    <span className='bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider'>
                      Сьогодні
                    </span>
                  )}
                  <div className='h-px bg-white/5 flex-1'></div>
                </div>

                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {sessionList.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onReschedule={handleRescheduleClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchSessions()
          toast.success('Сеанс створено успішно')
        }}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title='Скасування сеансу'
        message='Ви впевнені, що хочете скасувати цей сеанс? Цю дію неможливо скасувати.'
        confirmText='Так, скасувати'
        isDestructive
      />

      <InputModal
        isOpen={!!rescheduleData}
        onClose={() => setRescheduleData(null)}
        onSubmit={onConfirmReschedule}
        title='Перенести сеанс'
        label='Новий час початку'
        initialValue={getInitialRescheduleValue()}
        confirmText='Перенести'
        // @ts-ignore (type prop passing)
        type='datetime-local'
      />
    </div>
  )
}

const SessionCard = ({ session, onReschedule, onDelete }: any) => {
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  const isCancelled = session.status === 'Cancelled'

  return (
    <div
      className={`group relative bg-[var(--bg-card)] border rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${isCancelled ? 'border-[var(--color-error)]/30 opacity-70' : 'border-white/5 hover:border-[var(--color-primary)]/30'}`}
    >
      {isCancelled && (
        <div className='absolute top-0 right-0 bg-[var(--color-error)]/10 text-[var(--color-error)] text-[10px] font-bold px-2 py-1 rounded-bl-xl border-b border-l border-[var(--color-error)]/20 uppercase tracking-wider'>
          Скасовано
        </div>
      )}
      <div className='flex gap-4'>
        <div className='h-20 w-14 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-inner'>
          <Film size={20} className='text-[var(--text-muted)]' />
        </div>
        <div className='flex-1 min-w-0'>
          <h3
            className='font-bold text-white text-lg truncate pr-6'
            title={session.movieTitle}
          >
            {session.movieTitle}
          </h3>
          <div className='flex items-center gap-2 mt-2'>
            <div className='bg-white/5 border border-white/5 px-2 py-1 rounded text-white font-mono text-sm font-bold flex items-center gap-1.5'>
              <Clock size={12} className='text-[var(--color-primary)]' />
              {start.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <span className='text-[var(--text-muted)] text-xs font-mono'>
              →{' '}
              {end.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--text-muted)]'>
            <div className='flex items-center gap-1.5' title='Зал'>
              <MonitorPlay size={14} />
              <span className='truncate max-w-[100px]'>{session.hallName}</span>
            </div>
            <div className='h-3 w-px bg-white/10'></div>
            <div
              className='text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/5 truncate max-w-[120px]'
              title='Тариф'
            >
              {session.pricingName}
            </div>
          </div>
        </div>
      </div>
      {!isCancelled && (
        <div className='absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200'>
          <button
            type='button'
            onClick={() => onReschedule(session.id, session.startTime)}
            className='p-2 bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-blue-600 shadow-lg transition-colors'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            onClick={() => onDelete(session.id)}
            className='p-2 bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--color-error)] shadow-lg transition-colors'
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminSessionsPage
