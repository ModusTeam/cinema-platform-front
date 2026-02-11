import { cn } from '../../lib/utils'
import React from 'react'

interface AuroraTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: React.ElementType
}

export function AuroraText({
  className,
  children,
  as: Component = 'span',
  ...props
}: AuroraTextProps) {
  return (
    <Component
      className={cn('relative inline-flex overflow-hidden', className)}
      {...props}
    >
      <span className='relative z-10'>{children}</span>
      <span
        className='pointer-events-none absolute -inset-2 mix-blend-lighten blur-2xl opacity-50'
        style={{
          backgroundImage:
            'conic-gradient(from 90deg at 50% 50%, #00000000 50%, #0a0a0a 50%), radial-gradient(rgba(200,200,200,0.1) 0%, transparent 80%)',
        }}
      />
      <span
        className='pointer-events-none absolute -inset-[100%] animate-[aurora_60s_linear_infinite] opacity-70 blur-[30px] saturate-[150%]'
        style={{
          backgroundImage:
            'repeating-linear-gradient(100deg, var(--color-primary) 10%, #a855f7 20%, #3b82f6 30%, #a855f7 40%, var(--color-primary) 50%)',
          backgroundSize: '200% auto',
        }}
      />
    </Component>
  )
}
