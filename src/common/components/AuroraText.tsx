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
    <Component className={cn('relative inline-block', className)} {...props}>
      <span
        className='animate-[aurora_30s_linear_infinite] bg-clip-text text-transparent'
        style={{
          backgroundImage:
            'repeating-linear-gradient(100deg, #ef4444 10%, #f97316 20%, #fbbf24 30%, #f97316 40%, #ef4444 50%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </Component>
  )
}
