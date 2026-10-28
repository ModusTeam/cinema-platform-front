import { Calendar, Plus } from 'lucide-react'
import { useState } from 'react'
import type { SessionDto } from '@/features/admin/api/admin-sessions.service'
import { adminSessionsCopy } from '@/features/admin/config/adminSessions.copy'
import { useSessions } from '@/features/admin/model/useSessions'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import CreateSessionModal from '@/features/admin/ui/CreateSessionModal'
import SessionCard from '@/features/admin/ui/SessionCard'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import InputModal from '@/shared/ui/modals/InputModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const AdminSessionsPage = () => {
  const {
    sessions,
    isLoading,
    isError,
    refetch,
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
      throw new Error(adminSessionsCopy.deleteError)
    }
    setDeleteId(null)
  }

  const onConfirmReschedule = async (newTimeStr: string) => {
    if (!rescheduleData) return

    const newDate = new Date(newTimeStr)
    if (Number.isNaN(newDate.getTime())) {
      throw new Error(adminSessionsCopy.invalidDate)
    }

    const result = await rescheduleSession(
      rescheduleData.id,
      newDate.toISOString(),
    )
    if (result.success) {
      toast.success(adminSessionsCopy.rescheduleSuccess)
    } else {
      throw new Error(adminSessionsCopy.rescheduleError + result.error)
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
      <AdminPageHeader
        title={adminSessionsCopy.title}
        description={adminSessionsCopy.description}
      >
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} aria-hidden='true' /> {adminSessionsCopy.add}
        </Button>
      </AdminPageHeader>

      {isLoading ? (
        <output className='py-20 flex justify-center'>
          <GridLoader
            aria-hidden='true'
            className='h-8 w-8 animate-spin motion-reduce:animate-none text-[var(--text-muted)]'
          />
          <span className='sr-only'>Завантаження сеансів</span>
        </output>
      ) : isError && sessions.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <div className='space-y-8'>
          {isError && (
            <UnavailableState
              title='Не вдалося оновити розклад'
              description='Показано раніше завантажені сеанси.'
              onRetry={() => void refetch()}
            />
          )}
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
              <section
                key={dateKey}
                aria-label={dateObj.toLocaleDateString('uk-UA')}
              >
                <div className='flex flex-wrap items-baseline gap-4 border-b border-[var(--border-default)] pb-3'>
                  <h2 className='text-lg font-medium'>
                    {dateObj.toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      weekday: 'long',
                    })}
                  </h2>
                  {isToday && (
                    <span className='text-[var(--text-muted)] text-xs'>
                      {adminSessionsCopy.today}
                    </span>
                  )}
                  <span className='ml-auto text-xs tabular-nums text-[var(--text-muted)]'>
                    Сеансів: {sessionList.length}
                  </span>
                </div>

                <div>
                  {sessionList.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onReschedule={handleRescheduleClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
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
        type='datetime-local'
      />
    </div>
  )
}

export default AdminSessionsPage
