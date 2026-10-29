import type { Toast, ToastType } from './toast.types'

export const MAX_TOASTS = 4
export const TOAST_DURATION: Record<ToastType, number> = {
  success: 5000,
  info: 6500,
  warning: 10000,
  error: 0,
}

export function enqueueToast(toasts: Toast[], toast: Toast): Toast[] {
  if (
    toasts.some(
      item => item.message === toast.message && item.type === toast.type,
    )
  )
    return toasts
  // Retain urgent errors ahead of routine feedback when the stack fills up.
  const next = [...toasts, toast]
  if (next.length <= MAX_TOASTS) return next
  const removable = next.findIndex(item => item.type !== 'error')
  next.splice(removable < 0 ? 0 : removable, 1)
  return next
}
