import { X } from 'lucide-react'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { cn } from '@/shared/lib/utils'
import Button from '@/shared/ui/Button'
import ConfirmModal from './ConfirmModal'
import { Dialog } from './Dialog'

interface FormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  title: string
  description?: string
  children: ReactNode
  isBusy?: boolean
  isDirty?: boolean
  submitDisabled?: boolean
  confirmText?: string
  className?: string
}

export function FormDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  isBusy = false,
  isDirty = false,
  submitDisabled = false,
  confirmText = 'Зберегти',
  className,
}: FormDialogProps) {
  const id = useId()
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [discardOpen, setDiscardOpen] = useState(false)
  const busy = isBusy || pending

  useEffect(() => {
    if (isOpen) {
      setError('')
      setDiscardOpen(false)
    }
  }, [isOpen])

  const requestClose = () => {
    if (busy || submitting.current) return
    if (isDirty) setDiscardOpen(true)
    else onClose()
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || submitting.current || submitDisabled) return
    submitting.current = true
    setPending(true)
    setError('')
    try {
      await onSubmit(event)
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Не вдалося зберегти зміни. Спробуйте ще раз.',
      )
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={requestClose}
        titleId={`${id}-title`}
        descriptionId={description ? `${id}-description` : undefined}
        isBusy={busy}
        className={cn('max-w-md', className)}
      >
        <div className='flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-default)] px-6 py-4'>
          <div className='min-w-0'>
            <h2
              id={`${id}-title`}
              tabIndex={-1}
              data-modal-initial-focus
              className='type-public-section text-2xl'
            >
              {title}
            </h2>
            {description && (
              <p
                id={`${id}-description`}
                className='mt-2 text-sm leading-relaxed text-[var(--text-muted)]'
              >
                {description}
              </p>
            )}
          </div>
          <Button
            variant='ghost'
            className='w-11 shrink-0 px-0'
            onClick={requestClose}
            disabled={busy}
            aria-label='Закрити діалог'
          >
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={submit} className='flex min-h-0 flex-col'>
          <fieldset
            disabled={busy}
            className='min-h-0 min-w-0 max-w-full space-y-5 overflow-y-auto overscroll-contain p-6'
          >
            <legend className='sr-only'>{title}</legend>
            {children}
          </fieldset>
          <div className='shrink-0 border-t border-[var(--border-default)] p-6 pt-4'>
            {error && (
              <p
                role='alert'
                className='mb-4 whitespace-pre-line break-words text-sm text-[var(--color-error)]'
              >
                {error}
              </p>
            )}
            <div className='flex flex-wrap justify-end gap-3'>
              <Button
                variant='secondary'
                disabled={busy}
                onClick={requestClose}
              >
                Скасувати
              </Button>
              <Button type='submit' isLoading={busy} disabled={submitDisabled}>
                {confirmText}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
      <ConfirmModal
        isOpen={isOpen && discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          onClose()
        }}
        title='Відкинути зміни?'
        message='Незбережені зміни буде втрачено. Ви можете повернутися до редагування.'
        cancelText='Продовжити редагування'
        confirmText='Відкинути зміни'
        isDestructive
      />
    </>
  )
}
