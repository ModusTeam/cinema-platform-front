import { type ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/utils'
import { useModalFocus } from './useModalFocus'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  titleId: string
  descriptionId?: string
  isBusy?: boolean
  className?: string
  children: ReactNode
}

export const Dialog = ({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  isBusy = false,
  className,
  children,
}: DialogProps) => {
  const ref = useRef<HTMLDivElement>(null)
  useModalFocus(ref, isOpen, onClose, isBusy)
  if (!isOpen) return null

  return createPortal(
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 motion-reduce:animate-none animate-in fade-in duration-200'>
      <div
        ref={ref}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isBusy || undefined}
        tabIndex={-1}
        className={cn(
          'font-public flex max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 w-full flex-col overflow-hidden break-words bg-[var(--surface-elevated)] text-[var(--text-main)] border border-[var(--border-default)] rounded-lg shadow-2xl',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
