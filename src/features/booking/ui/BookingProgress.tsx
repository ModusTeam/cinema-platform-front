import { cn } from '@/shared/lib/utils'
import { bookingCopy } from '../config/booking.copy'

const BookingProgress = ({ step }: { step: number }) => (
  <nav aria-label={bookingCopy.progression} className='my-8 sm:my-10'>
    <ol className='grid grid-cols-4 gap-2 sm:gap-6'>
      {bookingCopy.steps.map((label, index) => (
        <li
          key={label}
          aria-current={step === index + 1 ? 'step' : undefined}
          className={cn(
            'min-w-0 border-t pt-3 text-xs sm:text-sm',
            step === index + 1
              ? 'border-[var(--color-primary)] text-[var(--text-main)]'
              : 'border-[var(--border-default)] text-[var(--text-muted)]',
          )}
        >
          <span className='mb-1 block tabular-nums sm:mr-3 sm:inline'>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={step === index + 1 ? 'font-semibold' : ''}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  </nav>
)

export default BookingProgress
