import { Calendar, Clock, DollarSign, Film, MonitorPlay, X } from 'lucide-react'
import { useId } from 'react'
import { useCreateSession } from '@/features/admin/model/useCreateSession'
import { GridLoader } from '@/shared/ui/GridLoader'
import { Dialog } from '@/shared/ui/modals/Dialog'
import UnavailableState from '@/shared/ui/UnavailableState'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateSessionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateSessionModalProps) => {
  const fieldId = useId()
  const titleId = `${fieldId}-title`
  const {
    movies,
    halls,
    pricings,
    movieId,
    setMovieId,
    hallId,
    setHallId,
    pricingId,
    setPricingId,
    date,
    setDate,
    time,
    setTime,
    isLoadingData,
    isDataError,
    retryData,
    isSubmitting,
    submit,
  } = useCreateSession(isOpen, onSuccess, onClose)

  if (!isOpen) return null

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      isBusy={isSubmitting}
      className='max-w-lg p-6 scale-100 animate-in zoom-in-95 duration-200'
    >
      <div className='flex shrink-0 items-center justify-between mb-6 border-b border-white/5 pb-4'>
        <h2
          id={titleId}
          tabIndex={-1}
          data-modal-initial-focus
          className='text-xl font-bold text-white'
        >
          Додати сеанс
        </h2>
        <button
          type='button'
          onClick={onClose}
          disabled={isSubmitting}
          aria-label='Закрити діалог'
          className='text-[var(--text-muted)] hover:text-white transition-colors'
        >
          <X size={24} />
        </button>
      </div>

      {isLoadingData ? (
        <div className='min-h-0 overflow-y-auto py-12 flex justify-center'>
          <GridLoader className='h-8 w-8 animate-spin text-[var(--text-muted)]' />
        </div>
      ) : isDataError ? (
        <UnavailableState
          onRetry={() => void retryData()}
          className='min-h-0 overflow-y-auto border-0 bg-transparent py-12'
        />
      ) : (
        <form
          onSubmit={e => {
            if (isSubmitting) {
              e.preventDefault()
              return
            }
            void submit(e)
          }}
          className='flex min-h-0 flex-col'
        >
          <div className='min-h-0 overflow-y-auto overscroll-contain space-y-5'>
            <div>
              <label
                htmlFor={`${fieldId}-movie`}
                className='text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-2'
              >
                <Film size={14} /> Фільм
              </label>
              <select
                id={`${fieldId}-movie`}
                value={movieId}
                onChange={e => setMovieId(e.target.value)}
                className='w-full rounded-lg bg-[var(--bg-main)] border border-white/10 p-3 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer hover:bg-[var(--bg-hover)]'
              >
                {movies.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.duration} хв)
                  </option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor={`${fieldId}-hall`}
                  className='text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-2'
                >
                  <MonitorPlay size={14} /> Зал
                </label>
                <select
                  id={`${fieldId}-hall`}
                  value={hallId}
                  onChange={e => setHallId(e.target.value)}
                  className='w-full rounded-lg bg-[var(--bg-main)] border border-white/10 p-3 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer hover:bg-[var(--bg-hover)]'
                >
                  {halls.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${fieldId}-pricing`}
                  className='text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-2'
                >
                  <DollarSign size={14} /> Тариф
                </label>
                <select
                  id={`${fieldId}-pricing`}
                  value={pricingId}
                  onChange={e => setPricingId(e.target.value)}
                  className='w-full rounded-lg bg-[var(--bg-main)] border border-white/10 p-3 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer hover:bg-[var(--bg-hover)]'
                >
                  {pricings.length === 0 && (
                    <option disabled>Немає тарифів</option>
                  )}
                  {pricings.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor={`${fieldId}-date`}
                  className='text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-2'
                >
                  <Calendar size={14} /> Дата
                </label>
                <input
                  id={`${fieldId}-date`}
                  type='date'
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className='w-full rounded-lg bg-[var(--bg-main)] border border-white/10 p-3 text-white focus:border-[var(--color-primary)] [color-scheme:dark]'
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label
                  htmlFor={`${fieldId}-time`}
                  className='text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-2'
                >
                  <Clock size={14} /> Час початку
                </label>
                <input
                  id={`${fieldId}-time`}
                  type='time'
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className='w-full rounded-lg bg-[var(--bg-main)] border border-white/10 p-3 text-white focus:border-[var(--color-primary)] [color-scheme:dark]'
                />
              </div>
            </div>
          </div>
          <div className='shrink-0 pt-4 flex justify-end gap-3 border-t border-white/5 mt-6'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors'
            >
              Скасувати
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-[var(--color-primary)] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-[var(--color-primary)]/20'
            >
              {isSubmitting ? (
                <GridLoader size={16} className='animate-spin' />
              ) : (
                <Calendar size={16} />
              )}
              {isSubmitting ? 'Створення...' : 'Запланувати'}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

export default CreateSessionModal
