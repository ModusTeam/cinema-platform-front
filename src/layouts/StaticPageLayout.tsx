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
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl'>
            <Info size={32} className='text-[var(--color-primary)]' />
          </div>
          <h1 className='text-4xl md:text-5xl font-black tracking-tighter text-white uppercase'>
            {title}
          </h1>
          <p className='text-lg text-[var(--text-muted)] max-w-xl mx-auto'>
            {subtitle}
          </p>
        </div>

        <div className='bg-[var(--bg-card)] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none' />

          <div className='prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-400 prose-strong:text-white prose-li:text-zinc-400'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaticPageLayout
