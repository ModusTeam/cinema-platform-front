import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Toast } from './toast.types'
import { TOAST_DURATION } from './toastQueue'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}
const tones = {
  success: 'text-[var(--color-success)]',
  error: 'text-[var(--color-error)]',
  info: 'text-[var(--text-muted)]',
  warning: 'text-[var(--color-warning)]',
}

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) => {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const remaining = useRef(TOAST_DURATION[toast.type])
  const paused = hovered || focused
  useEffect(() => {
    if (paused || TOAST_DURATION[toast.type] === 0) return
    const started = Date.now()
    const timer = setTimeout(() => onRemove(toast.id), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      )
    }
  }, [paused, toast.id, toast.type, onRemove])
  const Icon = icons[toast.type]
  return (
    <fieldset
      aria-label='Сповіщення'
      className='pointer-events-auto flex min-w-0 items-start gap-3 border border-[var(--border-default)] bg-[var(--surface-elevated)] p-4 text-[var(--text-main)] shadow-lg'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        size={19}
        className={`mt-1 shrink-0 ${tones[toast.type]}`}
        aria-hidden='true'
      />
      <p
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-atomic='true'
        className='min-w-0 flex-1 whitespace-pre-line break-words text-sm leading-relaxed'
      >
        {toast.message}
      </p>
      <button
        type='button'
        onClick={() => onRemove(toast.id)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label='Закрити сповіщення'
        className='-my-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]'
      >
        <X size={18} aria-hidden='true' />
      </button>
    </fieldset>
  )
}

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) => (
  <div className='font-public pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-[9999] flex max-h-[calc(100dvh-2rem)] flex-col gap-2 overflow-y-auto overscroll-contain md:left-auto md:w-[min(26rem,calc(100vw-2rem))]'>
    {toasts.map(toast => (
      <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
    ))}
  </div>
)

export default ToastContainer
