import { Clock } from 'lucide-react'
import { DEFAULT_SESSION_PRICE } from '@/entities/session/config/session.constants'
import type { Session } from '@/entities/session/model/session.types'
import { bookingCopy } from '@/features/booking/config/booking.copy'

interface SessionSelectorProps {
  sessions: Session[]
  selectedSession: Session | null
  onSelect: (session: Session) => void
}

const SessionSelector = ({
  sessions,
  selectedSession,
  onSelect,
}: SessionSelectorProps) => {
  const grouped = sessions.reduce(
    (acc, session) => {
      const dateKey = new Date(session.startTime).toDateString()
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(session)
      return acc
    },
    {} as Record<string, Session[]>,
  )

  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-3'>
        <div className='h-8 w-1 bg-[var(--color-primary)] rounded-full'></div>
        <h2 className='type-section text-2xl text-white'>
          {bookingCopy.selectSession}
        </h2>
      </div>

      <div className='space-y-8'>
        {Object.entries(grouped).map(([date, sessionsInDate]) => {
          const dateObj = new Date(date)
          const isToday = new Date().toDateString() === dateObj.toDateString()

          return (
            <div key={date} className='space-y-4'>
              <div className='flex items-baseline gap-3'>
                <h3 className='text-lg font-bold text-white capitalize'>
                  {dateObj.toLocaleDateString('uk-UA', {
                    weekday: 'long',
                  })}
                </h3>
                <span className='text-sm font-medium text-[var(--text-muted)]'>
                  {dateObj.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                {isToday && (
                  <span className='ml-2 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-success)]/10 text-[var(--color-success)] px-2 py-0.5 rounded border border-[var(--color-success)]/20'>
                    {bookingCopy.today}
                  </span>
                )}
              </div>

              <div className='flex flex-wrap gap-3'>
                {sessionsInDate.map(session => {
                  const isSelected = selectedSession?.id === session.id
                  const time = new Date(session.startTime).toLocaleTimeString(
                    'uk-UA',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )

                  return (
                    <button
                      type='button'
                      key={session.id}
                      onClick={() => onSelect(session)}
                      aria-pressed={isSelected}
                      className='selection-control group relative overflow-hidden rounded-xl px-5 py-3 flex flex-col items-center min-w-[100px]'
                    >
                      <div className='flex items-center gap-1.5 text-lg font-bold leading-none'>
                        <Clock
                          size={14}
                          className={
                            isSelected
                              ? 'text-white'
                              : 'text-[var(--color-primary)]'
                          }
                        />
                        {time}
                      </div>
                      <div
                        className={`text-[10px] font-medium mt-1 uppercase tracking-wide transition-colors ${isSelected ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] group-hover:text-zinc-300'}`}
                      >
                        {session.priceBase || DEFAULT_SESSION_PRICE} ₴
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SessionSelector
