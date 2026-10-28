import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export const AdminPageHeader = ({
  title,
  description,
  children,
}: AdminPageHeaderProps) => (
  <header className='flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-[var(--border-default)] pb-6'>
    <div className='min-w-0'>
      <h1 className='type-page font-public font-medium text-[var(--text-main)]'>
        {title}
      </h1>
      <p className='mt-2 text-sm leading-relaxed text-[var(--text-muted)]'>
        {description}
      </p>
    </div>
    {children && (
      <div className='flex shrink-0 items-center gap-3'>{children}</div>
    )}
  </header>
)
