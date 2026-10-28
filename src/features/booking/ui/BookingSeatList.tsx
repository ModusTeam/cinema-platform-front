import type { Seat } from '@/entities/hall/model/hall.types'
import { bookingCopy } from '../config/booking.copy'
import { formatBookingSeat } from '../lib/bookingDisplay'

const BookingSeatList = ({
  seats,
  onRemove,
  disabled = false,
}: {
  seats: Seat[]
  onRemove?: (seat: Seat) => void
  disabled?: boolean
}) =>
  seats.length ? (
    <ul className='space-y-3'>
      {seats.map(seat => (
        <li
          key={seat.id}
          className='flex items-center justify-between gap-3 text-sm'
        >
          <span>
            {formatBookingSeat(seat)}
            <span className='mt-1 block text-xs text-[var(--text-muted)]'>
              {seat.seatTypeName}
            </span>
          </span>
          {onRemove && (
            <button
              type='button'
              disabled={disabled}
              aria-label={`${bookingCopy.removeSeat}: ${formatBookingSeat(seat)}`}
              onClick={() => onRemove(seat)}
              className='min-h-11 shrink-0 px-2 text-sm underline underline-offset-4 hover:no-underline disabled:cursor-wait disabled:opacity-50'
            >
              {bookingCopy.removeSeat}
            </button>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className='text-sm text-[var(--text-muted)]'>{bookingCopy.noSeats}</p>
  )

export default BookingSeatList
