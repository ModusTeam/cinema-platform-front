import { Calendar, Clock, DollarSign, Film, MonitorPlay, X } from 'lucide-react'
import { useId } from 'react'
import { useCreateSession } from '@/features/admin/model/useCreateSession'
import Button from '@/shared/ui/Button'
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
    submitError,
    submit,
  } = useCreateSession(isOpen, onSuccess, onClose)

  if (!isOpen) return null

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      isBusy={isSubmitting}
      className='font-public max-w-lg rounded-lg p-6'
    >
      <div className='flex shrink-0 items-center justify-between mb-6 border-b border-white/5 pb-4'>
        <h2
          id={titleId}
          tabIndex={-1}
          data-modal-initial-focus
          className='type-section font-medium text-white'
        >
          Додати сеанс
        </h2>
        <Button
          type='button'
          onClick={onClose}
          disabled={isSubmitting}
          aria-label='Закрити діалог'
          variant='ghost'
          className='w-11 px-0'
        >
          <X size={24} />
        </Button>
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
          <fieldset
            disabled={isSubmitting}
            className='min-h-0 overflow-y-auto overscroll-contain space-y-5'
          >
            <legend className='sr-only'>Параметри сеансу</legend>
            <div>
              <label
                htmlFor={`${fieldId}-movie`}
                className='field-label mb-2 flex items-center gap-2'
              >
                <Film size={14} /> Фільм
              </label>
              <select
                id={`${fieldId}-movie`}
                value={movieId}
                onChange={e => setMovieId(e.target.value)}
                className='field'
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
                  className='field-label mb-2 flex items-center gap-2'
                >
                  <MonitorPlay size={14} /> Зал
                </label>
                <select
                  id={`${fieldId}-hall`}
                  value={hallId}
                  onChange={e => setHallId(e.target.value)}
                  className='field'
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
                  className='field-label mb-2 flex items-center gap-2'
                >
                  <DollarSign size={14} /> Тариф
                </label>
                <select
                  id={`${fieldId}-pricing`}
                  value={pricingId}
                  onChange={e => setPricingId(e.target.value)}
                  className='field'
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
                  className='field-label mb-2 flex items-center gap-2'
                >
                  <Calendar size={14} /> Дата
                </label>
                <input
                  id={`${fieldId}-date`}
                  type='date'
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className='field'
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label
                  htmlFor={`${fieldId}-time`}
                  className='field-label mb-2 flex items-center gap-2'
                >
                  <Clock size={14} /> Час початку
                </label>
                <input
                  id={`${fieldId}-time`}
                  type='time'
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className='field'
                />
              </div>
            </div>
          </fieldset>
          {submitError && (
            <p
              role='alert'
              className='mt-4 whitespace-pre-line text-sm text-[var(--color-error)]'
            >
              {submitError}
            </p>
          )}
          <div className='shrink-0 pt-4 flex justify-end gap-3 border-t border-white/5 mt-6'>
            <Button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              variant='secondary'
            >
              Скасувати
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {!isSubmitting && <Calendar size={16} aria-hidden='true' />}
              {isSubmitting ? 'Створення...' : 'Запланувати'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

export default CreateSessionModal
