import { ArrowLeft, CalendarX } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { bookingCopy } from '@/features/booking/config/booking.copy'
import { readSessionHandoff } from '@/features/booking/lib/sessionHandoff'
import { useBooking } from '@/features/booking/model/useBooking'
import { useCheckoutOptions } from '@/features/booking/model/useCheckoutOptions'
import BookingCheckout from '@/features/booking/ui/BookingCheckout'
import BookingOrderResult from '@/features/booking/ui/BookingOrderResult'
import BookingProgress from '@/features/booking/ui/BookingProgress'
import BookingScreening from '@/features/booking/ui/BookingScreening'
import BookingSeatList from '@/features/booking/ui/BookingSeatList'
import SeatSelector from '@/features/booking/ui/SeatSelector'
import SessionSelector from '@/features/booking/ui/SessionSelector'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'
import '@/features/booking/ui/booking.css'

const BookingLoading = () => (
  <output className='flex min-h-64 items-center justify-center gap-3 px-4'>
    <GridLoader size={24} />
    <span className='text-sm'>{bookingCopy.loading}</span>
  </output>
)

const BookingExperience = ({ movieId }: { movieId: string }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [handoffId] = useState(() => readSessionHandoff(location.state))
  const handoffConsumed = useRef(false)
  const booking = useBooking(movieId, handoffId)
  const { step, movie, selectedSession, hall, selectedSeats } = booking
  const options = useCheckoutOptions(
    selectedSession?.id ?? '',
    selectedSeats,
    step === 3,
  )
  const reducedMotion = useMotionPreference()
  const stepRegion = useRef<HTMLDivElement>(null)
  const busy = booking.isProcessingPayment || booking.orderOutcomeUnknown

  useEffect(() => {
    if (booking.isResolvingHandoff || handoffConsumed.current) return
    handoffConsumed.current = true
    // Consume navigation intent once. Refresh/back must not restore a stale
    // screening after the visitor explicitly changes the session.
    if (location.state !== null)
      navigate(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        { replace: true, state: null },
      )
  }, [booking.isResolvingHandoff, location, navigate])

  useEffect(() => {
    if (booking.isLoading || booking.isResolvingHandoff) return
    stepRegion.current
      ?.querySelector<HTMLElement>(`[data-booking-step="${step}"]`)
      ?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step, booking.isLoading, booking.isResolvingHandoff])

  if (booking.isLoading || booking.isResolvingHandoff) return <BookingLoading />
  if (!movie)
    return <UnavailableState onRetry={() => void booking.refetchMovie()} />

  return (
    <div className='font-public mx-auto max-w-6xl px-4 pb-16 pt-2 text-[var(--text-main)] sm:px-6 lg:px-8'>
      <Link
        to={`/movies/${movieId}`}
        aria-disabled={busy}
        onClick={event => {
          if (busy) event.preventDefault()
          else booking.resetSession()
        }}
        className='mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] aria-disabled:cursor-wait'
      >
        <ArrowLeft size={16} aria-hidden='true' />
        {bookingCopy.backToMovie}
      </Link>
      <BookingScreening movie={movie} session={selectedSession} />
      <BookingProgress step={step} />
      <div ref={stepRegion}>
        <motion.div
          key={step}
          role='group'
          data-booking-step={step}
          tabIndex={-1}
          aria-label={bookingCopy.steps[step - 1]}
          className='outline-offset-4'
          initial={reducedMotion ? false : { opacity: 0.85, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          {step === 1 && (
            <>
              {booking.handoffRejected && (
                <output className='mb-6 text-sm leading-relaxed text-[var(--color-warning)]'>
                  {bookingCopy.handoffRejected}
                </output>
              )}
              {booking.isSessionsError ? (
                <UnavailableState
                  onRetry={() => void booking.refetchSessions()}
                />
              ) : booking.sessions.length ? (
                <SessionSelector
                  sessions={booking.sessions}
                  selectedSession={null}
                  onSelect={booking.selectSession}
                />
              ) : (
                <EmptyState
                  icon={<CalendarX className='h-12 w-12' />}
                  title={bookingCopy.noSessionsTitle}
                  description={bookingCopy.noSessionsDescription}
                  actionLabel={bookingCopy.browseMovies}
                  onAction={() => navigate('/sessions')}
                />
              )}
            </>
          )}
          {(step === 2 || step === 3) && (
            <output
              aria-live='polite'
              aria-atomic='true'
              className='mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]'
            >
              <span>
                {booking.pendingSeatIds.size
                  ? bookingCopy.pendingSeats
                  : booking.isAvailabilityVerified
                    ? bookingCopy.seatsReady
                    : booking.isAvailabilityError
                      ? bookingCopy.availability.error
                      : bookingCopy.availability.checking}
              </span>
              {booking.isAvailabilityError && (
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => void booking.refreshOccupancy()}
                  className='min-h-11 underline underline-offset-4'
                >
                  {bookingCopy.availability.retry}
                </button>
              )}
            </output>
          )}
          {step === 2 && (
            <>
              <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
                <h2 className='type-public-section'>
                  {bookingCopy.selectSeats}
                </h2>
                <Button variant='ghost' onClick={booking.resetSession}>
                  {bookingCopy.changeSession}
                </Button>
              </div>
              {booking.isLoadingDetails ? (
                <BookingLoading />
              ) : booking.isDetailsError || !hall ? (
                <UnavailableState
                  onRetry={() => void booking.refetchDetails()}
                />
              ) : (
                <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]'>
                  <SeatSelector
                    hall={hall}
                    selectedSeats={selectedSeats}
                    onToggleSeat={booking.toggleSeat}
                    occupancy={booking.occupancy}
                    pendingSeatIds={booking.pendingSeatIds}
                    availabilityVerified={booking.isAvailabilityVerified}
                  />
                  <aside
                    className='booking-paper min-w-0'
                    aria-labelledby='selected-seats-heading'
                  >
                    <div className='p-6'>
                      <h3
                        id='selected-seats-heading'
                        className='type-public-title'
                      >
                        {bookingCopy.selectedSeats}
                      </h3>
                      <output className='mt-2 text-sm text-[var(--text-muted)]'>
                        {bookingCopy.selectionCount(selectedSeats.length)}
                      </output>
                      <div className='mt-5'>
                        <BookingSeatList
                          seats={selectedSeats}
                          onRemove={booking.toggleSeat}
                          disabled={booking.pendingSeatIds.size > 0}
                        />
                      </div>
                    </div>
                    <div className='booking-ticket-stub p-6'>
                      <p className='mb-5 text-sm leading-relaxed text-[var(--text-muted)]'>
                        {bookingCopy.seatHint}
                      </p>
                      <Button
                        onClick={booking.goToCheckout}
                        disabled={!booking.canCheckout}
                        className='min-h-12 w-full'
                      >
                        {bookingCopy.continue}
                      </Button>
                    </div>
                  </aside>
                </div>
              )}
            </>
          )}
          {step === 3 && selectedSession && (
            <BookingCheckout
              session={selectedSession}
              seats={selectedSeats}
              options={options}
              canCheckout={booking.canCheckout}
              submitting={booking.isProcessingPayment}
              orderError={booking.orderError}
              outcomeUnknown={booking.orderOutcomeUnknown}
              onSubmit={() =>
                void booking.submitOrder(
                  options.useLoyaltyPoints,
                  options.applyGoldUpgrade,
                  options.preview,
                )
              }
              onBack={booking.backToSeats}
            />
          )}
          {step === 4 && booking.orderId && (
            <BookingOrderResult orderId={booking.orderId} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

const BookingPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <BookingLoading />
  if (!user)
    return (
      <Navigate
        to='/auth/login'
        replace
        state={{
          from: location.pathname,
          sessionId: readSessionHandoff(location.state),
        }}
      />
    )
  if (!id) return <UnavailableState />
  return <BookingExperience key={`${id}:${user.id}`} movieId={id} />
}

export default BookingPage
