import { Armchair, CircleHelp, LockKeyhole, Wrench, X } from 'lucide-react'
import { useMemo } from 'react'
import { getSeatBounds } from '@/entities/hall/lib/seatGeometry'
import type { Hall, Seat } from '@/entities/hall/model/hall.types'
import type { SessionAvailability } from '@/entities/session/model/session.types'
import { bookingCopy } from '@/features/booking/config/booking.copy'
import { formatBookingSeat } from '@/features/booking/lib/bookingDisplay'
import { normalizeId } from '@/shared/lib/normalizeId'
import { GridLoader } from '@/shared/ui/GridLoader'
import { classifySeat } from '../lib/seatState'

const seatDescriptions = {
  selected: bookingCopy.seats.selected,
  locked: bookingCopy.seats.lockedTitle,
  sold: bookingCopy.seats.soldTitle,
  maintenance: bookingCopy.seats.maintenanceTitle,
  pending: bookingCopy.seats.pending,
  unknown: bookingCopy.seats.unknown,
}

interface SeatSelectorProps {
  hall: Hall
  selectedSeats: Seat[]
  onToggleSeat: (seat: Seat) => void
  pendingSeatIds: ReadonlySet<string>
  occupancy?: SessionAvailability
  availabilityVerified: boolean
}

const getSeatTypeStyle = (typeName: string = 'Standard') => {
  const lowerName = typeName.toLowerCase()
  if (lowerName.includes('vip') || lowerName.includes('lux'))
    return 'text-yellow-500'
  if (lowerName.includes('love') || lowerName.includes('sofa'))
    return 'text-pink-500'

  return 'text-zinc-400'
}

const SeatSelector = ({
  hall,
  selectedSeats,
  onToggleSeat,
  pendingSeatIds,
  occupancy,
  availabilityVerified,
}: SeatSelectorProps) => {
  const { rows, cols } = useMemo(() => getSeatBounds(hall.seats), [hall.seats])

  const occupancyById = new Map(
    occupancy?.seats.map(seat => [normalizeId(seat.id), seat]),
  )
  const selectedIds = new Set(selectedSeats.map(seat => normalizeId(seat.id)))
  const rowLabels = new Map(hall.seats.map(seat => [seat.gridY, seat.row]))

  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    hall.seats.forEach(seat => {
      types.add(seat.seatTypeName)
    })
    return Array.from(types)
  }, [hall.seats])

  return (
    <div className='min-w-0 space-y-5'>
      <p
        id='seat-map-hint'
        className='text-sm leading-relaxed text-[var(--text-muted)]'
      >
        {bookingCopy.wideHall}
      </p>
      <section
        aria-label={bookingCopy.seatMap}
        aria-describedby='seat-map-hint'
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll a wide hall.
        tabIndex={0}
        className='w-full overflow-x-auto overscroll-x-contain rounded-lg bg-[var(--surface-muted)] px-4 py-8 sm:px-8 sm:py-10'
      >
        <div
          className='mx-auto w-fit'
          style={{ minWidth: cols ? cols * 48 + 40 : undefined }}
        >
          <div className='mx-auto mb-10 w-3/4 max-w-lg'>
            <div className='h-2 rounded-t-[50%] border-t-2 border-[var(--text-muted)]' />
            <p className='mt-3 text-center text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase'>
              {bookingCopy.seats.screen}
            </p>
          </div>
          <div className='flex gap-3'>
            <div
              aria-hidden='true'
              className='grid w-8 shrink-0 gap-y-2 text-xs text-[var(--text-muted)]'
              style={{
                gridTemplateRows: rows ? `repeat(${rows}, 44px)` : undefined,
              }}
            >
              {Array.from(rowLabels, ([position, label]) => (
                <span
                  key={position}
                  style={{ gridRow: position }}
                  className='flex items-center justify-center'
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              className='grid w-fit gap-x-1 gap-y-2'
              style={{
                gridTemplateColumns: cols ? `repeat(${cols}, 44px)` : undefined,
                gridTemplateRows: rows ? `repeat(${rows}, 44px)` : undefined,
              }}
            >
              {hall.seats.map(seat => {
                const id = normalizeId(seat.id)
                const state = classifySeat(
                  seat,
                  occupancyById.get(id),
                  selectedIds.has(id),
                  pendingSeatIds.has(id),
                )
                const isSelected = state === 'selected'
                const isLocking = state === 'pending'
                const isOccupied =
                  state !== 'available' && !isSelected && !isLocking
                const disabled =
                  isOccupied ||
                  isLocking ||
                  (!availabilityVerified && !isSelected)
                const description =
                  state === 'available'
                    ? availabilityVerified
                      ? bookingCopy.seats.available
                      : bookingCopy.seats.unknown
                    : seatDescriptions[state]
                const visualState =
                  !availabilityVerified && state === 'available'
                    ? 'unknown'
                    : state
                const SeatIcon =
                  visualState === 'locked'
                    ? LockKeyhole
                    : visualState === 'sold'
                      ? X
                      : visualState === 'maintenance'
                        ? Wrench
                        : visualState === 'unknown'
                          ? CircleHelp
                          : Armchair
                const seatClasses =
                  isOccupied || visualState === 'unknown'
                    ? state === 'locked'
                      ? 'text-sky-400 border-sky-400/60 border-dashed cursor-not-allowed'
                      : 'text-[var(--text-faint)] border-transparent cursor-not-allowed'
                    : isLocking
                      ? 'text-[var(--text-main)] border-transparent cursor-wait'
                      : isSelected
                        ? 'text-white border-[var(--color-primary)] bg-[var(--action-primary)]'
                        : `${getSeatTypeStyle(seat.seatTypeName)} border-[var(--border-field)] hover:bg-[var(--bg-hover)]`
                return (
                  <button
                    type='button'
                    key={seat.id}
                    style={{ gridColumn: seat.gridX, gridRow: seat.gridY }}
                    aria-disabled={disabled}
                    aria-busy={isLocking}
                    aria-pressed={isSelected}
                    aria-label={`${formatBookingSeat(seat)}, ${seat.seatTypeName}. ${description}`}
                    onClick={() => {
                      if (!disabled) onToggleSeat(seat)
                    }}
                    className={`relative flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded border transition-colors motion-reduce:transition-none ${seatClasses}`}
                    title={`${formatBookingSeat(seat)}. ${description}`}
                  >
                    {isLocking ? (
                      <GridLoader size={18} />
                    ) : (
                      <SeatIcon
                        aria-hidden='true'
                        size={18}
                        strokeWidth={2}
                        fill={isSelected ? 'currentColor' : 'none'}
                      />
                    )}
                    <span
                      aria-hidden='true'
                      className='text-[11px] font-semibold leading-none tabular-nums'
                    >
                      {seat.number}
                    </span>
                    {getSeatTypeStyle(seat.seatTypeName) !==
                      'text-zinc-400' && (
                      <span
                        aria-hidden='true'
                        className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-current ${getSeatTypeStyle(seat.seatTypeName)}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        {!hall.seats.length && (
          <p className='text-sm text-[var(--text-muted)]'>
            {bookingCopy.noGeometry}
          </p>
        )}
      </section>
      <section
        aria-label={bookingCopy.seatStates}
        className='flex flex-wrap gap-x-5 gap-y-3 text-xs text-[var(--text-muted)]'
      >
        <div className='flex items-center gap-2'>
          <Armchair size={18} className='text-zinc-400' />
          <span>{bookingCopy.seats.available}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Armchair
            size={18}
            className='text-[var(--color-primary)]'
            fill='currentColor'
          />
          <span>{bookingCopy.seats.selected}</span>
        </div>
        <div className='flex items-center gap-2'>
          <X size={18} className='text-zinc-400' />
          <span>{bookingCopy.seats.occupied}</span>
        </div>

        <div className='flex items-center gap-2'>
          <LockKeyhole
            size={18}
            className='text-sky-400 border border-dashed border-sky-400/60 rounded'
          />
          <span>{bookingCopy.seats.locked}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Wrench size={18} className='text-zinc-400' />
          <span>{bookingCopy.seats.maintenance}</span>
        </div>
        <div className='flex items-center gap-2'>
          <GridLoader size={16} />
          <span>{bookingCopy.seats.pending}</span>
        </div>

        <div className='flex items-center gap-2'>
          <CircleHelp size={18} className='text-zinc-400' />
          <span>{bookingCopy.seats.unknown}</span>
        </div>
      </section>
      <section
        aria-label={bookingCopy.seatTypes}
        className='flex flex-wrap gap-x-5 gap-y-3 text-xs text-[var(--text-muted)]'
      >
        {availableTypes.map(type => {
          if (type.toLowerCase() === 'standard') return null
          return (
            <div key={type} className='flex items-center gap-2'>
              <Armchair
                size={18}
                className={getSeatTypeStyle(type)}
                fill='currentColor'
                fillOpacity={0.2}
              />
              <span>{type}</span>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default SeatSelector
