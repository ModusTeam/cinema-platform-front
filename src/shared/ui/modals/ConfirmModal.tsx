import { AlertTriangle } from 'lucide-react'
import { useId, useRef, useState } from 'react'
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
  const handleConfirm = async () => {
    if (isLoading || confirmingRef.current) return
    confirmingRef.current = true
    setIsConfirming(true)
    try {
      await onConfirm()
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
      className='max-w-sm rounded-2xl p-6 scale-100 motion-reduce:animate-none animate-in zoom-in-95 duration-200'
    >
      <div className='flex min-h-0 items-start gap-4 mb-4 overflow-y-auto overscroll-contain'>
        <div
          className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 id={titleId} className='type-section text-lg text-white mb-2'>
            {title}
          </h3>
          <p
            id={messageId}
            className='type-body text-[var(--text-muted)] text-sm'
          >
            {message}
          </p>
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
