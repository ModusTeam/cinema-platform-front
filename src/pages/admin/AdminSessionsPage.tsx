import { useState } from 'react'
import { useSessions } from '@/features/admin/model/useSessions'
import {
  Plus,
  Calendar,
} from 'lucide-react'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { GridLoader } from '@/shared/ui/GridLoader'
import CreateSessionModal from '@/features/admin/ui/CreateSessionModal'
import SessionCard from '@/features/admin/ui/SessionCard'
import { adminSessionsCopy } from '@/features/admin/config/adminSessions.copy'
import type { SessionDto } from '@/features/admin/api/admin-sessions.service'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import InputModal from '@/shared/ui/modals/InputModal'
import { useToast } from '@/shared/ui/toast/ToastContext'

const AdminSessionsPage = () => {
  const {
    sessions,
    isLoading,
    isError,
    refetch,
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
      toast.success(adminSessionsCopy.deleteSuccess)
    } else {
      toast.error(adminSessionsCopy.deleteError)
    }
    setDeleteId(null)
  }

  const onConfirmReschedule = async (newTimeStr: string) => {
    if (!rescheduleData) return

    const newDate = new Date(newTimeStr)
    if (Number.isNaN(newDate.getTime())) {
      toast.error(adminSessionsCopy.invalidDate)
      return
    }

    const result = await rescheduleSession(
      rescheduleData.id,
      newDate.toISOString(),
    )
    if (result.success) {
      toast.success(adminSessionsCopy.rescheduleSuccess)
    } else {
      toast.error(adminSessionsCopy.rescheduleError + result.error)
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
          <h1 className='text-3xl font-bold text-white'>
            {adminSessionsCopy.title}
          </h1>
          <p className='text-[var(--text-muted)] mt-1'>
            {adminSessionsCopy.description}
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsCreateModalOpen(true)}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> {adminSessionsCopy.add}
        </button>
      </div>

      {isLoading ? (
        <div className='py-20 flex justify-center'>
          <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
        </div>
      ) : isError && sessions.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <div className='space-y-10 animate-in fade-in slide-in-from-bottom-4'>
          {Object.keys(groupedSessions).length === 0 && (
            <EmptyState
              icon={<Calendar className='h-12 w-12' />}
              title={adminSessionsCopy.emptyTitle}
              description={adminSessionsCopy.emptyDescription}
              actionLabel={adminSessionsCopy.add}
              onAction={() => setIsCreateModalOpen(true)}
              className='py-20'
            />
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
                      {adminSessionsCopy.today}
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
          toast.success(adminSessionsCopy.createSuccess)
        }}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title={adminSessionsCopy.cancelTitle}
        message={adminSessionsCopy.cancelMessage}
        confirmText={adminSessionsCopy.confirmCancel}
        isDestructive
      />

      <InputModal
        isOpen={!!rescheduleData}
        onClose={() => setRescheduleData(null)}
        onSubmit={onConfirmReschedule}
        title={adminSessionsCopy.rescheduleTitle}
        label={adminSessionsCopy.newStart}
        initialValue={getInitialRescheduleValue()}
        confirmText={adminSessionsCopy.confirmReschedule}
        // @ts-ignore (type prop passing)
        type='datetime-local'
      />
    </div>
  )
}

export default AdminSessionsPage
