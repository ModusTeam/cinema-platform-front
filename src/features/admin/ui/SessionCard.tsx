import { Edit, Trash2 } from 'lucide-react'
import { SessionStatus } from '@/entities/session/model/session.types'
import Button from '@/shared/ui/Button'
import type { SessionDto } from '../api/admin-sessions.service'
import { adminSessionsCopy } from '../config/adminSessions.copy'

interface SessionCardProps {
  session: SessionDto
  onReschedule: (id: string, currentStart: string) => void
  onDelete: (id: string) => void
}

const SessionCard = ({ session, onReschedule, onDelete }: SessionCardProps) => {
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  const isCancelled = session.status === SessionStatus.Cancelled
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  return (
    <article className='grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--border-default)] py-4 last:border-0 xl:grid-cols-[7rem_minmax(0,1fr)_minmax(8rem,0.6fr)_auto]'>
      <div className='tabular-nums'>
        <time
          dateTime={session.startTime}
          className='text-2xl font-medium tracking-tight'
        >
          {formatTime(start)}
        </time>
        <p className='mt-1 text-xs text-[var(--text-muted)]'>
          до <time dateTime={session.endTime}>{formatTime(end)}</time>
        </p>
      </div>
      <div className='min-w-0'>
        <h3 className='text-base font-medium leading-snug'>
          {session.movieTitle}
        </h3>
        <p className='mt-1 text-sm leading-relaxed text-[var(--text-muted)]'>
          {session.hallName}
          <span className='xl:hidden'> · {session.pricingName}</span>
        </p>
        {isCancelled && (
          <p className='mt-1 text-xs text-[var(--color-error)]'>
            {adminSessionsCopy.cancelled}
          </p>
        )}
      </div>
      <p className='hidden text-sm text-[var(--text-muted)] xl:block'>
        {session.pricingName}
      </p>
      {!isCancelled ? (
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            onClick={() => onReschedule(session.id, session.startTime)}
            aria-label={`${adminSessionsCopy.rescheduleTitle}: ${session.movieTitle}`}
            className='px-3'
          >
            <Edit size={16} aria-hidden='true' />
            <span className='hidden min-[1200px]:inline'>Перенести</span>
          </Button>
          <Button
            variant='ghost'
            onClick={() => onDelete(session.id)}
            aria-label={`${adminSessionsCopy.cancelTitle}: ${session.movieTitle}`}
            className='w-11 px-0 text-[var(--color-error)]'
          >
            <Trash2 size={16} aria-hidden='true' />
          </Button>
        </div>
      ) : (
        <span className='text-xs text-[var(--text-faint)]'>Без дій</span>
      )}
    </article>
  )
}

export default SessionCard
