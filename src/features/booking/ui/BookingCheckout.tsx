import { Link } from 'react-router-dom'
import type { Seat } from '@/entities/hall/model/hall.types'
import type { Session } from '@/entities/session/model/session.types'
import Button from '@/shared/ui/Button'
import { bookingCopy } from '../config/booking.copy'
import {
  formatBookingSessionDateTime,
  formatCheckoutAmount,
} from '../lib/bookingDisplay'
import type { CheckoutOptions } from '../model/useCheckoutOptions'
import BookingSeatList from './BookingSeatList'
import CheckoutToggle from './CheckoutToggle'

interface BookingCheckoutProps {
  session: Session
  seats: Seat[]
  options: CheckoutOptions
  canCheckout: boolean
  submitting: boolean
  orderError: string | null
  outcomeUnknown: boolean
  onSubmit: () => void
  onBack: () => void
}

const BookingCheckout = ({
  session,
  seats,
  options,
  canCheckout,
  submitting,
  orderError,
  outcomeUnknown,
  onSubmit,
  onBack,
}: BookingCheckoutProps) => {
  const { preview } = options
  const amount = (value?: number) =>
    formatCheckoutAmount(value, preview?.currency ?? '')
  const canSubmit =
    canCheckout &&
    !!preview?.canCheckout &&
    !options.isLoading &&
    !options.isError &&
    !outcomeUnknown &&
    (!options.useLoyaltyPoints || !!preview.loyaltyPoints.applied) &&
    (!options.applyGoldUpgrade || !!preview.goldUpgrade.applied)

  return (
    <div className='grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:gap-16'>
      <section aria-labelledby='checkout-options-heading' className='min-w-0'>
        <h2 id='checkout-options-heading' className='type-public-section'>
          {bookingCopy.checkout.options}
        </h2>
        <p className='mt-3 max-w-lg text-sm leading-relaxed text-[var(--text-muted)]'>
          {bookingCopy.checkout.optionsHint}
        </p>
        <div className='mt-6'>
          <CheckoutToggle
            label={bookingCopy.checkout.goldUpgrade}
            description={
              options.goldBlockedReason ||
              preview?.goldUpgrade.reason ||
              options.goldAvailability?.reason ||
              (options.goldLoading
                ? bookingCopy.checkout.goldHint
                : options.goldError
                  ? bookingCopy.checkout.goldUnavailable
                  : bookingCopy.goldDiscount(
                      amount(
                        (options.applyGoldUpgrade
                          ? preview?.goldUpgrade
                          : options.goldAvailability
                        )?.discountAmount,
                      ),
                    ))
            }
            checked={options.applyGoldUpgrade}
            disabled={
              submitting ||
              outcomeUnknown ||
              options.isLoading ||
              options.goldDisabled
            }
            onToggle={options.setApplyGoldUpgrade}
          />
          {options.goldError && (
            <Button
              variant='ghost'
              className='mt-2 text-sm'
              onClick={() => void options.retryGold()}
              disabled={submitting || outcomeUnknown}
            >
              {bookingCopy.checkout.retry}
            </Button>
          )}
          <CheckoutToggle
            label={bookingCopy.checkout.loyaltyPoints}
            description={
              options.pointsBlockedReason ||
              options.pointsStatus ||
              preview?.loyaltyPoints.reason ||
              bookingCopy.pointsDiscount(
                options.points ?? 0,
                amount(preview?.loyaltyPoints.discountAmount),
              )
            }
            checked={options.useLoyaltyPoints}
            disabled={
              submitting ||
              outcomeUnknown ||
              options.isLoading ||
              options.pointsDisabled
            }
            onToggle={options.setUseLoyaltyPoints}
          />
        </div>
        <p className='mt-6 text-sm leading-relaxed text-[var(--text-muted)]'>
          {bookingCopy.result.mockPayment}
        </p>
        {orderError && (
          <div
            role='alert'
            className='mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-error)]'
          >
            <p>{orderError}</p>
            {outcomeUnknown && (
              <Link
                to='/profile'
                className='inline-flex min-h-11 items-center underline underline-offset-4'
              >
                {bookingCopy.success.profile}
              </Link>
            )}
          </div>
        )}
        <Button
          variant='ghost'
          disabled={submitting || outcomeUnknown}
          onClick={onBack}
          className='mt-6'
        >
          {bookingCopy.checkout.backToSeats}
        </Button>
      </section>
      <aside
        className='booking-paper min-w-0'
        aria-labelledby='order-summary-heading'
      >
        <div className='p-6 sm:p-8'>
          <h2 id='order-summary-heading' className='type-public-section'>
            {bookingCopy.checkout.title}
          </h2>
          <p className='mt-4 text-sm'>
            <time dateTime={session.startTime}>
              {formatBookingSessionDateTime(session.startTime)}
            </time>
            {session.hallName && (
              <span className='mt-1 block'>{session.hallName}</span>
            )}
          </p>
          <div className='my-6 border-t border-[var(--border-default)] pt-5'>
            <BookingSeatList seats={seats} />
          </div>
          <div
            aria-live='polite'
            aria-atomic='true'
            aria-busy={options.isLoading}
          >
            {options.isLoading ? (
              <p className='py-4 text-sm'>{bookingCopy.checkout.updating}</p>
            ) : options.isError ? (
              <div role='alert' className='space-y-3 text-sm'>
                <p>
                  {options.error instanceof Error
                    ? options.error.message
                    : bookingCopy.checkout.previewUnavailable}
                </p>
                <Button
                  variant='secondary'
                  onClick={() => void options.refetch()}
                  disabled={submitting || outcomeUnknown}
                >
                  {bookingCopy.checkout.retry}
                </Button>
              </div>
            ) : preview ? (
              <dl className='space-y-3 text-sm'>
                <div className='flex justify-between gap-4'>
                  <dt>{bookingCopy.checkout.baseTickets}</dt>
                  <dd className='tabular-nums'>
                    {amount(preview.originalAmount)}
                  </dd>
                </div>
                {preview.goldUpgrade.applied && (
                  <div className='flex justify-between gap-4'>
                    <dt>{bookingCopy.checkout.goldDiscount}</dt>
                    <dd className='tabular-nums'>
                      −{amount(preview.goldUpgrade.discountAmount)}
                    </dd>
                  </div>
                )}
                {preview.loyaltyPoints.applied && (
                  <div className='flex justify-between gap-4'>
                    <dt>
                      {bookingCopy.checkout.loyaltyDiscount} (
                      {preview.loyaltyPoints.pointsToDeduct})
                    </dt>
                    <dd className='tabular-nums'>
                      −{amount(preview.loyaltyPoints.discountAmount)}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className='text-sm'>{bookingCopy.checkout.noTotal}</p>
            )}
            {preview?.canCheckout === false && (
              <p className='mt-4 text-sm'>
                {bookingCopy.checkout.cannotCheckout}
              </p>
            )}
            {preview?.warnings.map(warning => (
              <p key={warning} className='mt-3 text-sm'>
                {warning}
              </p>
            ))}
          </div>
        </div>
        <div className='booking-ticket-stub p-6 sm:p-8'>
          <div className='mb-6 flex flex-wrap items-baseline justify-between gap-3'>
            <span className='text-sm'>{bookingCopy.checkout.total}</span>
            <strong
              className='text-3xl font-medium tabular-nums'
              data-testid='checkout-total'
            >
              {amount(preview?.finalAmountToPay)}
            </strong>
          </div>
          <Button
            className='w-full min-h-12'
            disabled={!canSubmit || submitting}
            isLoading={submitting}
            onClick={() => {
              if (canSubmit && !submitting) onSubmit()
            }}
          >
            {submitting
              ? bookingCopy.checkout.submitting
              : bookingCopy.checkout.pay}
          </Button>
        </div>
      </aside>
    </div>
  )
}

export default BookingCheckout
