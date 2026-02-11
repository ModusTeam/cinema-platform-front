import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className='space-y-2'>
        {label && (
          <label className='text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] ml-1'>
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-12 w-full px-4 py-2 transition-all duration-200',
            'text-base md:text-sm',
            'rounded-xl border border-white/10',
            'bg-[var(--bg-main)] text-white placeholder:text-zinc-600',
            'focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] focus-visible:shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error &&
              'border-[var(--color-error)] text-[var(--color-error)] focus-visible:ring-[var(--color-error)] focus-visible:border-[var(--color-error)] placeholder:text-[var(--color-error)]/50',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className='text-xs font-medium text-[var(--color-error)] ml-1 animate-in slide-in-from-top-1 fade-in'>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
