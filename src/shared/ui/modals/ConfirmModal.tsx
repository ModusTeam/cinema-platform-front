import { AlertTriangle, Loader2 } from 'lucide-react'
import { useId, useRef, useState } from 'react'
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
      className='max-w-sm rounded-2xl p-6 scale-100 animate-in zoom-in-95 duration-200'
    >
      <div className='flex min-h-0 items-start gap-4 mb-4 overflow-y-auto overscroll-contain'>
        <div
          className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3
            id={titleId}
            className='text-lg font-bold text-white leading-tight mb-2'
          >
            {title}
          </h3>
          <p
            id={messageId}
            className='text-[var(--text-muted)] text-sm leading-relaxed'
          >
            {message}
          </p>
        </div>
      </div>

      <div className='flex shrink-0 flex-col-reverse sm:flex-row justify-end gap-3 mt-6'>
        <button
          type='button'
          onClick={onClose}
          disabled={isBusy}
          data-modal-initial-focus
          className='w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 active:scale-95'
        >
          {cancelText}
        </button>
        <button
          type='button'
          onClick={() => void handleConfirm()}
          disabled={isBusy}
          className={`
              w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 sm:py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
              ${
                isDestructive
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--color-primary)]/20'
              }
            `}
        >
          {isBusy && <Loader2 size={16} className='animate-spin' />}
          {confirmText}
        </button>
      </div>
    </Dialog>
  )
}

export default ConfirmModal
