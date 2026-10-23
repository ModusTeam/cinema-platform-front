import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import Button from './Button'

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
      <h3 className='type-section text-lg font-semibold text-[var(--text-main)]'>
        {title}
      </h3>
      <p className='type-body mt-2 max-w-[36ch] text-sm text-[var(--text-muted)]'>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button type='button' onClick={onAction} className='mt-6'>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
