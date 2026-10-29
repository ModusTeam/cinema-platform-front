import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import ToastContainer from './ToastContainer'
import type { Toast, ToastType } from './toast.types'
import { enqueueToast } from './toastQueue'

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}
const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])
  const addToast = useCallback((message: string, type: ToastType) => {
    const toast = { id: crypto.randomUUID(), message, type }
    setToasts(prev => enqueueToast(prev, toast))
  }, [])
  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast],
  )
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return useMemo(
    () => ({
      success: (msg: string) => context.addToast(msg, 'success'),
      error: (msg: string) => context.addToast(msg, 'error'),
      info: (msg: string) => context.addToast(msg, 'info'),
      warning: (msg: string) => context.addToast(msg, 'warning'),
    }),
    [context.addToast],
  )
}
