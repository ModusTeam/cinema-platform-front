import {
  Armchair,
  ArrowLeft,
  CalendarX,
  CheckCircle,
  Clock,
  MapPin,
  Ticket,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { GridLoader } from '@/shared/ui/GridLoader'
import { useLoyalty } from '@/features/loyalty/model/useLoyalty'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useCheckoutPreview } from '@/features/booking/api/useCheckoutPreview'
import SeatSelector from '@/features/booking/ui/SeatSelector'
import SessionSelector from '@/features/booking/ui/SessionSelector'
import { useBooking } from '@/features/booking/model/useBooking'
import CheckoutToggle from '@/features/booking/ui/CheckoutToggle'
import {
  bookingCopy,
  GOLD_UPGRADE_REJECTION_CODES,
  LOYALTY_POINTS_REJECTION_CODES,
} from '@/features/booking/config/booking.copy'
import {
  formatBookingSeat,
  formatBookingSessionDateTime,
  formatCheckoutAmount,
} from '@/features/booking/lib/bookingDisplay'

const BookingPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const {
    step,
    movie,
    sessions,
    selectedSession,
    hall,
    selectedSeats,
    isLoading,
    isLoadingDetails,
    isMovieError,
    isSessionsError,
    isDetailsError,
    refetchMovie,
    refetchSessions,
    refetchDetails,
    isProcessingPayment,
    selectSession,
    resetSession,
    goToCheckout,
    backToSeats,
    toggleSeat,
    submitOrder,
  } = useBooking(id)

  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [applyGoldUpgrade, setApplyGoldUpgrade] = useState(false)
  const [goldUpgradeBlockedReason, setGoldUpgradeBlockedReason] = useState<
    string | null
  >(null)
  const [loyaltyPointsBlockedReason, setLoyaltyPointsBlockedReason] = useState<
    string | null
  >(null)
  const loyaltyQuery = useLoyalty()
  const loyaltyPoints = loyaltyQuery.data?.points ?? 0
  const isLoyaltyDisabled = loyaltyQuery.isError || loyaltyPoints <= 0
  const selectedSeatIds = useMemo(
    () => selectedSeats.map(seat => seat.id),
    [selectedSeats],
  )
  const selectedSeatIdsKey = selectedSeatIds.join('|')
  const {
    preview,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    error: previewError,
  } = useCheckoutPreview({
    sessionId: selectedSession?.id || '',
    seatIds: selectedSeatIds,
    useLoyaltyPoints,
    applyGoldUpgrade,
    enabled: step === 3,
  })
  const {
    preview: goldUpgradeAvailabilityPreview,
    isLoading: isGoldUpgradeAvailabilityLoading,
  } = useCheckoutPreview({
    sessionId: selectedSession?.id || '',
    seatIds: selectedSeatIds,
    useLoyaltyPoints: false,
    applyGoldUpgrade: true,
    enabled: step === 3 && !applyGoldUpgrade,
  })
  const goldUpgradeAvailability = goldUpgradeAvailabilityPreview?.goldUpgrade

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/auth/login', { replace: true })
    }
  }, [user, isAuthLoading, navigate])

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: step === 1 ? 'auto' : 'smooth',
    })
  }, [step])

  useEffect(() => {
    if (!selectedSession?.id && !selectedSeatIdsKey) return
    setGoldUpgradeBlockedReason(null)
    setLoyaltyPointsBlockedReason(null)
  }, [selectedSeatIdsKey, selectedSession?.id])

  useEffect(() => {
    if (
      preview?.goldUpgrade.requested &&
      preview.goldUpgrade.canApply === false
    ) {
      setApplyGoldUpgrade(false)
      if (
        preview.goldUpgrade.reasonCode &&
        GOLD_UPGRADE_REJECTION_CODES.has(preview.goldUpgrade.reasonCode)
      ) {
        setGoldUpgradeBlockedReason(
          preview.goldUpgrade.reason || bookingCopy.checkout.goldUnavailable,
        )
      }
    }
  }, [
    preview?.goldUpgrade.canApply,
    preview?.goldUpgrade.reason,
    preview?.goldUpgrade.reasonCode,
    preview?.goldUpgrade.requested,
  ])

  useEffect(() => {
    if (
      goldUpgradeAvailability?.requested &&
      goldUpgradeAvailability.canApply === false &&
      goldUpgradeAvailability.reasonCode &&
      GOLD_UPGRADE_REJECTION_CODES.has(goldUpgradeAvailability.reasonCode)
    ) {
      setGoldUpgradeBlockedReason(
        goldUpgradeAvailability.reason || bookingCopy.checkout.goldUnavailable,
      )
    }

    if (
      goldUpgradeAvailability?.requested &&
      goldUpgradeAvailability.canApply
    ) {
      setGoldUpgradeBlockedReason(null)
    }
  }, [goldUpgradeAvailability])

  useEffect(() => {
    if (
      preview?.loyaltyPoints.requested &&
      preview.loyaltyPoints.canApply === false
    ) {
      setUseLoyaltyPoints(false)
      if (
        preview.loyaltyPoints.reasonCode &&
        LOYALTY_POINTS_REJECTION_CODES.has(preview.loyaltyPoints.reasonCode)
      ) {
        setLoyaltyPointsBlockedReason(
          preview.loyaltyPoints.reason || bookingCopy.checkout.loyaltyUnavailable,
        )
      }
    }
  }, [
    preview?.loyaltyPoints.canApply,
    preview?.loyaltyPoints.reason,
    preview?.loyaltyPoints.reasonCode,
    preview?.loyaltyPoints.requested,
  ])

  if (isAuthLoading || (isLoading && !movie)) {
    return (
      <div className='flex h-screen items-center justify-center bg-[var(--bg-main)] text-white'>
        <GridLoader className='animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-[var(--bg-main)] px-4 text-center animate-in fade-in zoom-in duration-500'>
        <div className='bg-[var(--bg-card)] p-12 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center'>
          <div className='h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6'>
            <CheckCircle className='h-12 w-12 text-[var(--color-success)]' />
          </div>
          <h1 className='text-4xl font-bold text-white mb-2'>
            {bookingCopy.success.title}
          </h1>
          <p className='text-[var(--text-muted)] max-w-md mb-8'>
            {bookingCopy.success.description}
          </p>
          <div className='flex gap-4'>
            <Link
              to='/profile'
              className='rounded-xl bg-white px-8 py-3 font-bold text-black hover:bg-zinc-200 transition-colors'
            >
              {bookingCopy.success.profile}
            </Link>
            <Link
              to='/'
              className='rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-bold text-white hover:bg-white/10 transition-colors'
            >
              {bookingCopy.success.home}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isMovieError && !movie) {
    return <UnavailableState onRetry={() => void refetchMovie()} />
  }

  const genresList = Array.isArray(movie?.genres) ? movie.genres : []
  const sessionDateTimeLabel = selectedSession
    ? formatBookingSessionDateTime(selectedSession.startTime)
    : bookingCopy.fallbackSessionDate
  const selectedSeatsLabel =
    selectedSeats.length > 0
      ? selectedSeats
          .map(formatBookingSeat)
          .join(', ')
      : bookingCopy.fallbackSeats
  const currency = preview?.currency || '₴'
  const previewErrorMessage =
    previewError instanceof Error
      ? previewError.message
      : bookingCopy.checkout.previewUnavailable
  const canPay =
    Boolean(preview?.canCheckout) && !isPreviewError && !isPreviewLoading
  const formatAmount = (amount?: number) =>
    formatCheckoutAmount(amount, currency)
  const isGoldUpgradeRejected =
    preview?.goldUpgrade.requested && preview.goldUpgrade.canApply === false
  const isLoyaltyPointsRejected =
    preview?.loyaltyPoints.requested && preview.loyaltyPoints.canApply === false
  const isGoldUpgradeDisabled =
    isGoldUpgradeAvailabilityLoading ||
    isGoldUpgradeRejected ||
    Boolean(goldUpgradeBlockedReason)
  const isLoyaltyPointsDisabled =
    isLoyaltyDisabled ||
    loyaltyQuery.isLoading ||
    isLoyaltyPointsRejected ||
    Boolean(loyaltyPointsBlockedReason)

  const handleSubmitOrder = async () => {
    await submitOrder(useLoyaltyPoints, applyGoldUpgrade)
  }

  return (
    <div className='min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pb-20'>
      <header className='border-b border-white/5 bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4'>
        <div className='container mx-auto flex items-center justify-between'>
          <Link
            to={`/movies/${id}`}
            className='flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors group'
          >
            <div className='p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors'>
              <ArrowLeft size={16} />
            </div>
            <span>{bookingCopy.backToMovie}</span>
          </Link>

          <div className='flex items-center gap-2'>
            {[1, 2, 3, 4].map((item, index) => (
              <div key={item} className='flex items-center gap-2'>
                <div
                  className={`h-2 w-2 rounded-full ${
                    step >= item ? 'bg-[var(--color-primary)]' : 'bg-white/20'
                  }`}
                />
                {index < 3 && (
                  <div
                    className={`h-1 w-6 rounded-full ${
                      step > item ? 'bg-[var(--color-primary)]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        {step === 1 && (
          <div className='animate-in fade-in slide-in-from-left-4 duration-500'>
            {isSessionsError && sessions.length === 0 ? (
              <UnavailableState onRetry={() => void refetchSessions()} className='min-h-[300px]' />
            ) : sessions.length > 0 ? (
              <SessionSelector
                sessions={sessions}
                selectedSession={null}
                onSelect={selectSession}
              />
            ) : (
              <EmptyState
                icon={<CalendarX className='h-12 w-12' />}
                title={bookingCopy.noSessionsTitle}
                description={bookingCopy.noSessionsDescription}
                actionLabel={bookingCopy.browseMovies}
                onAction={() => navigate('/sessions')}
                className='min-h-[300px]'
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <h2 className='flex items-center gap-3 text-2xl font-bold text-white'>
                <Ticket className='text-[var(--color-primary)]' />{' '}
                {bookingCopy.selectSeats}
              </h2>
              <button
                type='button'
                disabled={selectedSeats.length === 0}
                onClick={goToCheckout}
                className='rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none'
              >
                {bookingCopy.continue}
              </button>
            </div>

            {isLoadingDetails ? (
              <div className='flex justify-center py-20'>
                <GridLoader className='animate-spin text-[var(--color-primary)]' />
              </div>
            ) : isDetailsError && !hall ? (
              <UnavailableState onRetry={() => void refetchDetails()} />
            ) : hall ? (
              <SeatSelector
                hall={hall}
                selectedSeats={selectedSeats}
                onToggleSeat={toggleSeat}
                occupiedSeatIds={selectedSession?.occupiedSeatIds || []}
              />
            ) : null}

            <div className='mt-8 flex justify-center'>
              <button
                type='button'
                onClick={resetSession}
                className='py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-white'
              >
                {bookingCopy.changeSession}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='overflow-hidden rounded-3xl bg-[#111111] shadow-2xl shadow-black/40 lg:grid lg:min-h-[680px] lg:grid-cols-[65fr_35fr]'>
              <div className='relative min-h-[420px] lg:min-h-full'>
                <img
                  src={movie?.posterUrl || movie?.backdropUrl}
                  alt={movie?.title}
                  className='absolute inset-0 h-full w-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent' />
                <div className='absolute inset-x-0 bottom-0 space-y-5 p-6 sm:p-8'>
                  <div>
                    <div className='mb-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-300'>
                      <span className='rounded-full bg-white/10 px-3 py-1'>
                        {genresList[0] || bookingCopy.fallbackGenre}
                      </span>
                      <span className='rounded-full bg-white/10 px-3 py-1'>
                        {movie?.duration} хв
                      </span>
                      <span className='rounded-full bg-white/10 px-3 py-1'>
                        {movie?.year}
                      </span>
                    </div>
                    <h1 className='max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl'>
                      {movie?.title}
                    </h1>
                  </div>

                  <div className='grid gap-3 text-sm font-medium text-zinc-300 sm:grid-cols-3'>
                    <div className='flex items-center gap-2'>
                      <Clock size={16} className='text-red-400' />
                      {sessionDateTimeLabel}
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin size={16} className='text-red-400' />
                      {selectedSession?.hallName || bookingCopy.fallbackHall}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Armchair size={16} className='text-red-400' />
                      {selectedSeatsLabel}
                    </div>
                  </div>
                </div>
              </div>

              <aside className='relative flex flex-col bg-[#151515] p-6 sm:p-8'>
                <div className='mb-8 flex items-start justify-between gap-4'>
                  <div className='border-l-4 border-red-600 pl-3'>
                    <h2 className='mt-2 text-2xl font-black text-white'>
                      {bookingCopy.checkout.title}
                    </h2>
                  </div>
                </div>

                <div className='space-y-3'>
                  <CheckoutToggle
                    label={bookingCopy.checkout.goldUpgrade}
                    description={
                      goldUpgradeBlockedReason ||
                      preview?.goldUpgrade.reason ||
                      bookingCopy.goldDiscount(
                        formatAmount(preview?.goldUpgrade.discountAmount),
                      )
                    }
                    checked={applyGoldUpgrade}
                    disabled={isGoldUpgradeDisabled}
                    onToggle={setApplyGoldUpgrade}
                  />
                  <CheckoutToggle
                    label={bookingCopy.checkout.loyaltyPoints}
                    description={
                      loyaltyPointsBlockedReason ||
                      preview?.loyaltyPoints.reason ||
                      bookingCopy.pointsDiscount(
                        loyaltyPoints,
                        formatAmount(preview?.loyaltyPoints.discountAmount),
                      )
                    }
                    checked={useLoyaltyPoints}
                    disabled={isLoyaltyPointsDisabled}
                    onToggle={setUseLoyaltyPoints}
                  />
                </div>

                <div className='relative mt-8 min-h-48 space-y-4 text-sm'>
                  {isPreviewLoading && (
                    <div className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#151515]/80 backdrop-blur-sm'>
                      <GridLoader className='animate-spin text-red-400' />
                    </div>
                  )}

                  {isPreviewError ? (
                    <div className='rounded-2xl bg-red-500/10 p-4 text-sm text-red-200'>
                      {previewErrorMessage}
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center justify-between text-zinc-400'>
                        <span>{bookingCopy.checkout.baseTickets}</span>
                        <span className='text-white'>
                          {formatAmount(preview?.originalAmount)}
                        </span>
                      </div>
                      {preview?.goldUpgrade.applied && (
                        <div className='flex items-center justify-between text-zinc-400'>
                          <span>{bookingCopy.checkout.goldDiscount}</span>
                          <span className='text-red-300'>
                            -{formatAmount(preview.goldUpgrade.discountAmount)}
                          </span>
                        </div>
                      )}
                      {preview?.loyaltyPoints.applied && (
                        <div className='flex items-center justify-between text-zinc-400'>
                          <span>{bookingCopy.checkout.loyaltyDiscount}</span>
                          <span className='text-red-300'>
                            -
                            {formatAmount(preview.loyaltyPoints.discountAmount)}
                          </span>
                        </div>
                      )}
                      {preview?.canCheckout === false && (
                        <div className='rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-200'>
                          {bookingCopy.checkout.cannotCheckout}
                        </div>
                      )}
                      {preview?.warnings.map(warning => (
                        <div
                          key={warning}
                          className='rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-200'
                        >
                          {warning}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className='mt-auto pt-8'>
                  <div className='mb-6 flex items-end justify-between'>
                    <span className='text-sm font-semibold text-zinc-400'>
                      {bookingCopy.checkout.total}
                    </span>
                    <span className='text-4xl font-black text-white'>
                      {formatAmount(preview?.finalAmountToPay)}
                    </span>
                  </div>

                  <button
                    type='button'
                    disabled={
                      isProcessingPayment ||
                      !canPay ||
                      isPreviewError ||
                      isPreviewLoading
                    }
                    onClick={handleSubmitOrder}
                    className='flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-4 text-base font-black text-white shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01] hover:from-red-400 hover:to-red-500 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isProcessingPayment ? (
                      <GridLoader className='animate-spin' />
                    ) : (
                      <>
                        <Ticket size={20} /> {bookingCopy.checkout.pay}
                      </>
                    )}
                  </button>

                  <button
                    type='button'
                    onClick={backToSeats}
                    className='mt-5 w-full py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white'
                  >
                    {bookingCopy.checkout.backToSeats}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default BookingPage
