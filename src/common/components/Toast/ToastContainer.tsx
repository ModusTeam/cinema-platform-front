import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { Toast } from './ToastContext'

const icons = {
  success: <CheckCircle size={20} className='text-green-500' />,
  error: <AlertCircle size={20} className='text-red-500' />,
  info: <Info size={20} className='text-blue-500' />,
  warning: <AlertTriangle size={20} className='text-yellow-500' />,
}

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl shadow-2xl border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-md text-white
        w-full md:min-w-[300px] md:max-w-md
        transition-all duration-300 ease-in-out transform touch-manipulation
        ${isExiting ? 'opacity-0 translate-y-full md:translate-x-full md:translate-y-0' : 'opacity-100 translate-y-0 translate-x-0'}
        animate-in slide-in-from-bottom-5 md:slide-in-from-right-10 fade-in
      `}
      role='alert'
    >
      <div className='shrink-0'>{icons[toast.type]}</div>
      <p className='text-sm font-medium flex-1 break-words'>{toast.message}</p>
      <button
        type='button'
        onClick={handleRemove}
        className='p-2 -mr-2 text-[var(--text-muted)] hover:text-white transition-colors active:scale-95'
      >
        <X size={18} />
      </button>
    </div>
  )
}

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) => {
  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:bottom-5 md:right-5 z-[9999] flex flex-col gap-3 md:items-end pointer-events-none'>
      <div className='pointer-events-auto flex flex-col gap-3 w-full md:w-auto'>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}

export default ToastContainer
