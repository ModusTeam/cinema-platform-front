import { Clock, Edit, Film, MonitorPlay, Trash2 } from 'lucide-react'
import { SessionStatus } from '@/entities/session/model/session.types'
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

  return (
    <div
      className={`group relative bg-[var(--bg-card)] border rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${isCancelled ? 'border-[var(--color-error)]/30 opacity-70' : 'border-white/5 hover:border-[var(--color-primary)]/30'}`}
    >
      {isCancelled && (
        <div className='absolute top-0 right-0 bg-[var(--color-error)]/10 text-[var(--color-error)] text-[10px] font-bold px-2 py-1 rounded-bl-xl border-b border-l border-[var(--color-error)]/20 uppercase tracking-wider'>
          {adminSessionsCopy.cancelled}
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
            <div
              className='flex items-center gap-1.5'
              title={adminSessionsCopy.hall}
            >
              <MonitorPlay size={14} />
              <span className='truncate max-w-[100px]'>{session.hallName}</span>
            </div>
            <div className='h-3 w-px bg-white/10'></div>
            <div
              className='text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/5 truncate max-w-[120px]'
              title={adminSessionsCopy.pricing}
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

export default SessionCard
