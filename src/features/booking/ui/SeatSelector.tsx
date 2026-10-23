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

  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    hall.seats.forEach(seat => {
      types.add(seat.seatTypeName)
    })
    return Array.from(types)
  }, [hall.seats])

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'>
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
          <span className='text-white'>{bookingCopy.seats.selected}</span>
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
      </div>

      <div className='relative w-full overflow-x-auto rounded-3xl border border-white/5 bg-[var(--bg-card)] p-8 sm:p-12 shadow-2xl'>
        <div className='relative mx-auto mb-16 w-3/4 max-w-lg perspective-[500px]'>
          <div className='h-12 w-full bg-gradient-to-b from-[var(--color-primary)]/20 to-transparent transform rotateX(-45deg) origin-bottom rounded-t-3xl blur-md opacity-50 absolute -top-8 left-0'></div>
          <div className='h-2 w-full rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent shadow-[0_0_30px_rgba(239,68,68,0.6)] relative z-10' />
          <p className='mt-6 text-center text-[10px] font-black tracking-[0.5em] text-[var(--text-muted)] uppercase opacity-60'>
            {bookingCopy.seats.screen}
          </p>
        </div>

        <div
          className='grid gap-y-3 gap-x-2 mx-auto w-fit'
          style={{
            gridTemplateColumns: cols ? `repeat(${cols}, 32px)` : undefined,
            gridTemplateRows: rows ? `repeat(${rows}, 32px)` : undefined,
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
              isOccupied || isLocking || (!availabilityVerified && !isSelected)
            const description =
              state === 'available'
                ? availabilityVerified
                  ? bookingCopy.seats.availableTitle(
                      formatBookingSeat(seat),
                      seat.seatTypeName,
                    )
                  : bookingCopy.seats.unknown
                : seatDescriptions[state]

            const visualState =
              !availabilityVerified && state === 'available' ? 'unknown' : state
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
                  ? 'text-sky-400 border-sky-400/60 border-dashed bg-sky-400/5 cursor-not-allowed'
                  : 'text-zinc-400 border-transparent cursor-not-allowed'
                : isLocking
                  ? 'text-[var(--color-primary)] border-transparent cursor-wait'
                  : isSelected
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--selection-bg)]'
                    : `${getSeatTypeStyle(seat.seatTypeName)} border-transparent hover:bg-white/10 hover:border-white/30`
            const typeStyle = getSeatTypeStyle(seat.seatTypeName)
            const isSpecialType = typeStyle !== 'text-zinc-400'

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
                className={`group relative flex h-8 w-8 items-center justify-center rounded border transition-colors duration-150 ${seatClasses}`}
                title={description}
              >
                {isLocking ? (
                  <GridLoader
                    size={16}
                    className='animate-spin motion-reduce:animate-none'
                  />
                ) : (
                  <SeatIcon
                    aria-hidden='true'
                    size={22}
                    strokeWidth={2}
                    fill={isSelected ? 'currentColor' : 'none'}
                  />
                )}

                {isSpecialType && (
                  <span
                    aria-hidden='true'
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-current ${typeStyle}`}
                  />
                )}

                {!disabled && (
                  <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-20'>
                    {bookingCopy.seats.hoverLabel(seat.row, seat.number)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SeatSelector
