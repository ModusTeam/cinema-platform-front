import { type Session } from '@/features/halls/model/hall.types'
import { Clock } from 'lucide-react'

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
    <div className='space-y-8 animate-in fade-in slide-in-from-left-4 duration-500'>
      <div className='flex items-center gap-3'>
        <div className='h-8 w-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_var(--color-primary)]'></div>
        <h2 className='text-2xl font-bold text-white'>Оберіть сеанс</h2>
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
                    Сьогодні
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
                      className={`
                                group relative overflow-hidden rounded-xl px-5 py-3 transition-all duration-300 border flex flex-col items-center min-w-[100px]
                                ${
                                  isSelected
                                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105'
                                    : 'bg-[var(--bg-card)] border-white/10 text-zinc-400 hover:border-white/30 hover:text-white hover:bg-white/5'
                                }
                            `}
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
                        className={`text-[10px] font-medium mt-1 uppercase tracking-wide transition-colors ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)] group-hover:text-zinc-300'}`}
                      >
                        {session.priceBase || 150} ₴
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
