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

import EmptyState from '@/common/components/EmptyState'
import { GridLoader } from '@/common/components/GridLoader'
import { useLoyalty } from '@/features/account/hooks/useLoyalty'
import { useAuth } from '@/features/auth/AuthContext'
import { useCheckoutPreview } from '@/features/booking/api/useCheckoutPreview'
import SeatSelector from '@/features/booking/components/SeatSelector'
import SessionSelector from '@/features/booking/components/SessionSelector'
import { useBooking } from '@/features/booking/hooks/useBooking'

interface CheckoutToggleProps {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onToggle: (value: boolean) => void
}

const CheckoutToggle = ({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: CheckoutToggleProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onToggle(!checked)}
    className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3 text-left transition-colors ${
      disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/10'
    }`}
  >
    <span>
      <span className='block text-sm font-bold text-white'>{label}</span>
      <span className='mt-1 block text-xs text-zinc-400'>{description}</span>
    </span>
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-red-600' : 'bg-zinc-700'
      }`}
      aria-hidden='true'
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  </button>
)

const GOLD_UPGRADE_REJECTION_CODES = new Set([
  'GOLD_UPGRADE_REQUIRES_GOLD_TIER',
  'GOLD_UPGRADE_ALREADY_USED_THIS_MONTH',
  'GOLD_UPGRADE_NO_ELIGIBLE_TICKET',
])

const LOYALTY_POINTS_REJECTION_CODES = new Set([
  'LOYALTY_POINTS_NOT_ALLOWED_FOR_SESSION',
  'LOYALTY_POINTS_INSUFFICIENT_BALANCE',
])

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
          preview.goldUpgrade.reason || 'GOLD upgrade is unavailable.',
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
        goldUpgradeAvailability.reason || 'GOLD upgrade is unavailable.',
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
          preview.loyaltyPoints.reason || 'Loyalty points are unavailable.',
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
            Оплата успішна!
          </h1>
          <p className='text-[var(--text-muted)] max-w-md mb-8'>
            Ваші квитки успішно заброньовані. Ми надіслали підтвердження на вашу
            електронну пошту.
          </p>
          <div className='flex gap-4'>
            <Link
              to='/profile'
              className='rounded-xl bg-white px-8 py-3 font-bold text-black hover:bg-zinc-200 transition-colors'
            >
              Go to profile
            </Link>
            <Link
              to='/'
              className='rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-bold text-white hover:bg-white/10 transition-colors'
            >
              Go to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const genresList = Array.isArray(movie?.genres) ? movie.genres : []
  const sessionDateTimeLabel = selectedSession
    ? `${new Date(selectedSession.startTime).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
      })}, ${new Date(selectedSession.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : '10 червня, 22:00'
  const selectedSeatsLabel =
    selectedSeats.length > 0
      ? selectedSeats
          .map(seat => `Ряд ${seat.row}, Місце ${seat.number}`)
          .join(', ')
      : 'Ряд 5, Місце 12, 13'
  const currency = preview?.currency || '₴'
  const previewErrorMessage =
    previewError instanceof Error
      ? previewError.message
      : 'Не вдалося завантажити попередній розрахунок'
  const canPay =
    Boolean(preview?.canCheckout) && !isPreviewError && !isPreviewLoading
  const formatAmount = (amount?: number) =>
    amount === undefined ? '—' : `${amount} ${currency}`
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
            <span>До фільму</span>
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
            {sessions.length > 0 ? (
              <SessionSelector
                sessions={sessions}
                selectedSession={null}
                onSelect={selectSession}
              />
            ) : (
              <EmptyState
                icon={<CalendarX className='h-12 w-12' />}
                title='Актуальних сеансів немає'
                description='Для цього фільму поки не заплановано майбутніх показів. Перегляньте афішу, щоб знайти інший сеанс.'
                actionLabel='Афіша кінотеатру'
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
                <Ticket className='text-[var(--color-primary)]' /> Оберіть місця
              </h2>
              <button
                type='button'
                disabled={selectedSeats.length === 0}
                onClick={goToCheckout}
                className='rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none'
              >
                Продовжити
              </button>
            </div>

            {isLoadingDetails ? (
              <div className='flex justify-center py-20'>
                <GridLoader className='animate-spin text-[var(--color-primary)]' />
              </div>
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
                Змінити сеанс
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
                        {genresList[0] || 'Кіно'}
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
                      {selectedSession?.hallName || 'Зал 1'}
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
                      Ваше замовлення
                    </h2>
                  </div>
                </div>

                <div className='space-y-3'>
                  <CheckoutToggle
                    label='Ultra-comfort'
                    description={
                      goldUpgradeBlockedReason ||
                      preview?.goldUpgrade.reason ||
                      `Знижка: ${formatAmount(
                        preview?.goldUpgrade.discountAmount,
                      )}`
                    }
                    checked={applyGoldUpgrade}
                    disabled={isGoldUpgradeDisabled}
                    onToggle={setApplyGoldUpgrade}
                  />
                  <CheckoutToggle
                    label='Використати бали'
                    description={
                      loyaltyPointsBlockedReason ||
                      preview?.loyaltyPoints.reason ||
                      `Доступно: ${loyaltyPoints} балів, знижка: ${formatAmount(
                        preview?.loyaltyPoints.discountAmount,
                      )}`
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
                        <span>Base tickets</span>
                        <span className='text-white'>
                          {formatAmount(preview?.originalAmount)}
                        </span>
                      </div>
                      {preview?.goldUpgrade.applied && (
                        <div className='flex items-center justify-between text-zinc-400'>
                          <span>Gold upgrade discount</span>
                          <span className='text-red-300'>
                            -{formatAmount(preview.goldUpgrade.discountAmount)}
                          </span>
                        </div>
                      )}
                      {preview?.loyaltyPoints.applied && (
                        <div className='flex items-center justify-between text-zinc-400'>
                          <span>Loyalty discount</span>
                          <span className='text-red-300'>
                            -
                            {formatAmount(preview.loyaltyPoints.discountAmount)}
                          </span>
                        </div>
                      )}
                      {preview?.canCheckout === false && (
                        <div className='rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-200'>
                          Неможливо оформити замовлення. Перевірте обрані місця
                          та параметри знижок.
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
                      Total
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
                        <Ticket size={20} /> Оплатити замовлення
                      </>
                    )}
                  </button>

                  <button
                    type='button'
                    onClick={backToSeats}
                    className='mt-5 w-full py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white'
                  >
                    Назад до місць
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
