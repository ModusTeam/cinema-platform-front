import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Ticket, CalendarX } from 'lucide-react'
import { GridLoader } from '../common/components/GridLoader'
import SessionSelector from '../features/booking/components/SessionSelector'
import SeatSelector from '../features/booking/components/SeatSelector'
import { useAuth } from '../features/auth/AuthContext'
import { useBooking } from '../features/booking/hooks/useBooking'

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
    totalPrice,
    isLoading,
    isLoadingDetails,
    isProcessingPayment,
    selectSession,
    resetSession,
    toggleSeat,
    submitOrder,
  } = useBooking(id)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/auth/login', { replace: true })
    }
  }, [user, isAuthLoading, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  if (isAuthLoading || (isLoading && !movie)) {
    return (
      <div className='flex h-screen items-center justify-center bg-[var(--bg-main)] text-white'>
        <GridLoader className='animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (step === 3) {
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
              to='/'
              className='rounded-xl bg-white px-8 py-3 font-bold text-black hover:bg-zinc-200 transition-colors'
            >
              На головну
            </Link>
            <Link
              to='/profile'
              className='rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-bold text-white hover:bg-white/10 transition-colors'
            >
              Мої квитки
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const genresList = Array.isArray(movie?.genres)
    ? movie!.genres.map(g => {
        if (typeof g === 'string') return g
        return (g as any).name
      })
    : []

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
            <div
              className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-white/20'}`}
            ></div>
            <div
              className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-white/20'}`}
            ></div>
          </div>
        </div>
      </header>

      <main className='container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[1fr_350px]'>
        <div>
          {step === 1 && (
            <div className='animate-in fade-in slide-in-from-left-4 duration-500'>
              {sessions.length > 0 ? (
                <SessionSelector
                  sessions={sessions}
                  selectedSession={null}
                  onSelect={selectSession}
                />
              ) : (
                <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--bg-card)]/30 p-12 text-center min-h-[300px]'>
                  <div className='mb-6 rounded-full bg-white/5 p-6'>
                    <CalendarX className='h-10 w-10 text-[var(--text-muted)]' />
                  </div>
                  <h3 className='text-xl font-bold text-white'>
                    Актуальних сеансів немає
                  </h3>
                  <Link
                    to='/sessions'
                    className='mt-8 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white'
                  >
                    Афіша кінотеатру
                  </Link>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
              <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-3'>
                <Ticket className='text-[var(--color-primary)]' /> Оберіть місця
              </h2>

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
            </div>
          )}
        </div>

        <div className='h-fit'>
          <div className='rounded-2xl border border-white/5 bg-[var(--bg-card)] p-6 backdrop-blur-sm sticky top-24 shadow-2xl overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-orange-500'></div>

            <h3 className='mb-6 text-lg font-black uppercase tracking-wider text-white/50'>
              Ваше замовлення
            </h3>

            <div className='mb-6 flex gap-4'>
              <img
                src={movie?.posterUrl || movie?.backdropUrl}
                alt={movie?.title}
                className='h-24 w-16 rounded-lg object-cover shadow-lg bg-zinc-800'
              />
              <div className='flex flex-col justify-center'>
                <div className='font-bold text-white line-clamp-2 text-lg leading-tight mb-1'>
                  {movie?.title}
                </div>
                <div className='text-xs font-medium text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded w-fit'>
                  {movie?.year} • {genresList[0]}
                </div>
              </div>
            </div>

            <div className='space-y-4 mb-6'>
              <div className='flex justify-between items-center text-sm py-3 border-b border-white/5 border-dashed'>
                <div className='text-[var(--text-muted)]'>Сеанс</div>
                <div className='text-white font-medium text-right'>
                  {selectedSession ? (
                    <>
                      <div>
                        {new Date(
                          selectedSession.startTime,
                        ).toLocaleDateString()}
                      </div>
                      <div className='text-[var(--color-primary)] font-bold text-base'>
                        {new Date(selectedSession.startTime).toLocaleTimeString(
                          [],
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </div>
                    </>
                  ) : (
                    <span className='text-zinc-600 italic'>—</span>
                  )}
                </div>
              </div>
              <div className='flex justify-between items-center text-sm py-3 border-b border-white/5 border-dashed'>
                <div className='text-[var(--text-muted)]'>Зал</div>
                <div className='text-white font-medium'>
                  {selectedSession?.hallName || (
                    <span className='text-zinc-600 italic'>—</span>
                  )}
                </div>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className='mb-6 bg-white/5 rounded-xl p-4 border border-white/5'>
                <div className='text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3'>
                  Обрані місця ({selectedSeats.length})
                </div>
                <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1'>
                  {selectedSeats.map(s => (
                    <div
                      key={s.id}
                      className='flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--bg-main)] px-3 py-1.5 text-xs text-white shadow-sm'
                    >
                      <span className='text-[var(--text-muted)]'>Р{s.row}</span>
                      <span className='font-bold text-[var(--color-primary)]'>
                        М{s.number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='mt-auto pt-4'>
              <div className='flex justify-between items-end mb-6'>
                <span className='text-[var(--text-muted)] font-medium pb-1'>
                  Разом до сплати
                </span>
                <span className='text-3xl font-black text-white'>
                  {totalPrice}{' '}
                  <span className='text-lg text-[var(--text-muted)] font-normal'>
                    ₴
                  </span>
                </span>
              </div>

              {step === 1 ? (
                <button
                  type='button'
                  disabled={true}
                  className='w-full rounded-xl bg-white/10 py-4 font-bold text-white/50 cursor-not-allowed border border-white/5'
                >
                  Оберіть сеанс
                </button>
              ) : (
                <button
                  type='button'
                  disabled={selectedSeats.length === 0 || isProcessingPayment}
                  onClick={submitOrder}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-4 font-bold text-white hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-100'
                >
                  {isProcessingPayment ? (
                    <GridLoader className='animate-spin' />
                  ) : (
                    <>
                      <Ticket size={20} /> Оплатити квитки
                    </>
                  )}
                </button>
              )}

              {step === 2 && (
                <button
                  type='button'
                  onClick={resetSession}
                  className='w-full mt-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors'
                >
                  Змінити сеанс
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookingPage
