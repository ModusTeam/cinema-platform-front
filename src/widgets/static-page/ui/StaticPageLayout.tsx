import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

interface StaticPageLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

const StaticPageLayout = ({
  title,
  subtitle,
  children,
}: StaticPageLayoutProps) => {
  return (
    <div className='min-h-screen bg-[var(--bg-main)] px-4 py-20 text-[var(--text-main)]'>
      <div className='container mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='mb-12 text-center space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center text-[var(--color-primary)]'>
            <Info size={32} className='text-[var(--color-primary)]' />
          </div>
          <h1 className='type-display text-4xl sm:text-4xl md:text-5xl tracking-tighter text-white uppercase'>
            {title}
          </h1>
          <p className='text-lg text-[var(--text-muted)] max-w-xl mx-auto'>
            {subtitle}
          </p>
        </div>

        <div className='bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-10'>
          <div className='prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-400 prose-strong:text-white prose-li:text-zinc-400'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaticPageLayout
