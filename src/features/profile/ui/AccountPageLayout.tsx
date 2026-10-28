import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './account.css'

interface AccountPageLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function AccountPageLayout({
  title,
  description,
  children,
}: AccountPageLayoutProps) {
  return (
    <div className='account font-public'>
      <div className='mx-auto max-w-[1440px] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12'>
        <div className='mb-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-[var(--account-rule)] pb-4'>
          <Link
            to='/profile'
            className='account-link inline-flex min-h-11 items-center gap-2 text-sm'
          >
            <ArrowLeft size={16} aria-hidden='true' />
            Особистий кабінет
          </Link>
          <nav
            aria-label='Програма лояльності'
            className='flex flex-wrap gap-x-6 gap-y-1 text-sm'
          >
            <NavLink end to='/account/loyalty' className='account-section-link'>
              Лояльність
            </NavLink>
            <NavLink
              to='/account/loyalty/history'
              className='account-section-link'
            >
              Історія балів
            </NavLink>
            <NavLink
              to='/profile/achievements'
              className='account-section-link'
            >
              Досягнення
            </NavLink>
          </nav>
        </div>
        <header className='mb-9 max-w-3xl lg:mb-12'>
          <h1 className='account-heading'>{title}</h1>
          <p className='mt-5 max-w-2xl text-base leading-relaxed text-[var(--account-muted)]'>
            {description}
          </p>
        </header>
        {children}
      </div>
    </div>
  )
}
