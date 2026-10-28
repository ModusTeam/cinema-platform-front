import { AlertTriangle } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import Button from '@/shared/ui/Button'
import { Dialog } from './Dialog'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) => {
  const titleId = useId()
  const messageId = useId()
  const [isConfirming, setIsConfirming] = useState(false)
  const confirmingRef = useRef(false)
  const isBusy = isLoading || isConfirming
  const [error, setError] = useState('')
  useEffect(() => {
    if (isOpen) setError('')
  }, [isOpen])
  const handleConfirm = async () => {
    if (isLoading || confirmingRef.current) return
    confirmingRef.current = true
    setIsConfirming(true)
    setError('')
    try {
      await onConfirm()
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Не вдалося виконати дію. Спробуйте ще раз.',
      )
    } finally {
      confirmingRef.current = false
      setIsConfirming(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      descriptionId={messageId}
      isBusy={isBusy}
      className='max-w-md p-6'
    >
      <div className='flex min-h-0 items-start gap-4 mb-4 overflow-y-auto overscroll-contain'>
        <div
          className={`shrink-0 pt-1 ${isDestructive ? 'text-[var(--color-error)]' : 'text-[var(--text-muted)]'}`}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 id={titleId} className='type-public-section text-2xl mb-2'>
            {title}
          </h2>
          <p
            id={messageId}
            className='type-body text-[var(--text-muted)] text-sm'
          >
            {message}
          </p>
          {error && (
            <p
              role='alert'
              className='mt-4 whitespace-pre-line text-sm text-[var(--color-error)]'
            >
              {error}
            </p>
          )}
        </div>
      </div>

      <div className='flex shrink-0 flex-col-reverse sm:flex-row justify-end gap-3 mt-6'>
        <Button
          type='button'
          onClick={onClose}
          disabled={isBusy}
          data-modal-initial-focus
          variant='secondary'
          className='w-full sm:w-auto'
        >
          {cancelText}
        </Button>
        <Button
          type='button'
          onClick={() => void handleConfirm()}
          disabled={isBusy}
          variant={isDestructive ? 'destructive' : 'primary'}
          isLoading={isBusy}
          className='w-full sm:w-auto'
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmModal
