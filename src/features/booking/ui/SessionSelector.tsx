import { localDateKey } from '@/entities/session/lib/sessionDates'
import type { Session } from '@/entities/session/model/session.types'
import { normalizeId } from '@/shared/lib/normalizeId'
import { bookingCopy } from '../config/booking.copy'
import { formatCheckoutAmount } from '../lib/bookingDisplay'

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
  const grouped = new Map<string, Session[]>()
  for (const session of sessions) {
    const date = localDateKey(new Date(session.startTime))
    const group = grouped.get(date) ?? []
    group.push(session)
    grouped.set(date, group)
  }

  return (
    <section aria-labelledby='session-heading'>
      <h2 id='session-heading' className='type-public-section'>
        {bookingCopy.selectSession}
      </h2>
      <p className='mt-2 text-[var(--text-muted)]'>{bookingCopy.sessionHint}</p>
      <div className='mt-8 space-y-8'>
        {Array.from(grouped, ([date, screenings]) => {
          const start = new Date(screenings[0].startTime)
          return (
            <section
              key={date}
              aria-label={start.toLocaleDateString('uk-UA', {
                dateStyle: 'full',
              })}
              className='grid gap-4 border-t border-[var(--border-default)] pt-5 sm:grid-cols-[10rem_1fr]'
            >
              <h3 className='text-base capitalize'>
                <span className='block font-semibold'>
                  {start.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <span className='mt-1 block text-sm text-[var(--text-muted)]'>
                  {start.toLocaleDateString('uk-UA', { weekday: 'long' })}
                  {date === localDateKey(new Date())
                    ? ` / ${bookingCopy.today}`
                    : ''}
                </span>
              </h3>
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
                {screenings.map(session => {
                  const selected =
                    normalizeId(selectedSession?.id ?? '') ===
                    normalizeId(session.id)
                  const hasPrice =
                    session.priceBase !== undefined &&
                    Number.isFinite(session.priceBase) &&
                    session.priceBase >= 0
                  return (
                    <button
                      key={session.id}
                      type='button'
                      aria-pressed={selected}
                      onClick={() => onSelect(session)}
                      className='selection-control min-h-28 min-w-0 rounded-lg p-4 text-left'
                    >
                      <time
                        dateTime={session.startTime}
                        className='block text-2xl font-medium tabular-nums'
                      >
                        {new Date(session.startTime).toLocaleTimeString(
                          'uk-UA',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </time>
                      {session.hallName && (
                        <span className='mt-2 block break-words text-sm'>
                          {session.hallName}
                        </span>
                      )}
                      <span className='mt-1 block text-xs text-[var(--text-muted)]'>
                        {hasPrice
                          ? `${bookingCopy.basePrice}: ${formatCheckoutAmount(session.priceBase, '₴')}`
                          : bookingCopy.priceOnCheckout}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <p className='mt-8 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]'>
        {bookingCopy.pricingHint}
      </p>
    </section>
  )
}

export default SessionSelector
