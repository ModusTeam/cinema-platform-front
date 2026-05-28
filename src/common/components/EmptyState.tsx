import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--bg-card)]/40 px-6 py-16 text-center',
        className,
      )}
    >
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[var(--text-faint)]'>
        {icon}
      </div>
      <h3 className='text-lg font-semibold text-[var(--text-main)]'>{title}</h3>
      <p className='mt-2 max-w-[36ch] text-sm leading-relaxed text-[var(--text-muted)]'>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20 transition-colors hover:bg-[var(--color-primary-hover)]'
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
