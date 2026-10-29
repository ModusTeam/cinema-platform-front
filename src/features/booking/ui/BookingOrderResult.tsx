import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ordersService } from '@/entities/order/api/orders.service'
import { normalizeId } from '@/shared/lib/normalizeId'
import Button, { buttonStyles } from '@/shared/ui/Button'
import { bookingCopy } from '../config/booking.copy'
import { getBookingOrderResult } from '../lib/orderResult'

const BookingOrderResult = ({ orderId }: { orderId: string }) => {
  const query = useQuery({
    queryKey: ['booking-order-status', orderId],
    queryFn: () => ordersService.getStatus(orderId),
    staleTime: 0,
    retry: false,
  })
  const status =
    !query.isError && normalizeId(query.data?.id ?? '') === normalizeId(orderId)
      ? query.data?.status
      : undefined
  const result = getBookingOrderResult(status)
  return (
    <section
      className='mx-auto max-w-2xl py-4 sm:py-8'
      aria-labelledby='order-result-heading'
    >
      <div className='booking-paper p-6 sm:p-10'>
        <h2 id='order-result-heading' className='type-public-section'>
          {bookingCopy.success.title}
        </h2>
        <p className='mt-5 text-xs text-[var(--text-muted)]'>
          {bookingCopy.result.orderNumber}
        </p>
        <p className='mt-1 break-all text-sm tabular-nums'>{orderId}</p>
        <div
          aria-live='polite'
          aria-atomic='true'
          className='mt-6 border-t border-[var(--border-default)] pt-6'
        >
          <h3 className='text-xl font-medium'>{result.title}</h3>
          <p className='mt-3 text-sm leading-relaxed'>
            {query.isFetching
              ? bookingCopy.result.checking
              : query.isError || !status
                ? bookingCopy.result.unavailable
                : result.description}
          </p>
        </div>
        <Button
          variant='ghost'
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className='mt-4'
        >
          {bookingCopy.result.refresh}
        </Button>
        <div className='booking-ticket-stub mt-6 flex flex-wrap gap-3 pt-6'>
          <Link to='/profile' className={buttonStyles()}>
            {bookingCopy.success.profile}
          </Link>
          <Link to='/' className={buttonStyles('ghost')}>
            {bookingCopy.success.home}
          </Link>
        </div>
      </div>
      <p className='mt-5 text-sm leading-relaxed text-[var(--text-muted)]'>
        {bookingCopy.result.mockPayment}
      </p>
    </section>
  )
}

export default BookingOrderResult
