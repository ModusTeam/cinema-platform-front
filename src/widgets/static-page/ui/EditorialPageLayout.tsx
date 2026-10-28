import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import './editorial.css'

interface EditorialPageLayoutProps {
  title: string
  subtitle: string
  surface?: 'dark' | 'paper'
  children: ReactNode
}

export default function EditorialPageLayout({
  title,
  subtitle,
  surface = 'dark',
  children,
}: EditorialPageLayoutProps) {
  return (
    <div
      className={cn(
        'editorial font-public',
        surface === 'paper' && 'editorial-paper',
      )}
    >
      <div className='mx-auto max-w-[1440px] px-4 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16'>
        <header className='grid gap-6 border-b border-[var(--editorial-rule)] pb-10 md:pb-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16'>
          <h1 className='editorial-heading'>{title}</h1>
          <p className='max-w-[54ch] text-lg leading-relaxed text-[var(--text-muted)]'>
            {subtitle}
          </p>
        </header>
        {children}
      </div>
    </div>
  )
}
