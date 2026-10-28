import type { ReactNode } from 'react'
import './auth.css'

interface AuthLayoutProps {
  title: string
  description: string
  introTitle: string
  introDescription: string
  children: ReactNode
}

const AuthLayout = ({
  title,
  description,
  introTitle,
  introDescription,
  children,
}: AuthLayoutProps) => (
  <div className='auth-shell font-public'>
    <div className='mx-auto grid max-w-[1600px] lg:grid-cols-2'>
      <div className='hidden min-w-0 flex-col justify-between gap-16 px-8 py-16 lg:flex lg:px-16'>
        <p className='auth-intro-title max-w-lg'>{introTitle}</p>
        <p className='max-w-sm border-t border-[var(--border-default)] pt-6 text-lg leading-relaxed text-[var(--text-muted)]'>
          {introDescription}
        </p>
      </div>
      <section
        aria-labelledby='auth-heading'
        className='auth-paper min-w-0 px-4 py-10 sm:px-8 sm:py-14 lg:px-16'
      >
        <div className='mx-auto w-full max-w-md'>
          <h1 id='auth-heading' className='auth-heading'>
            {title}
          </h1>
          <p className='mb-8 mt-4 leading-relaxed text-[var(--text-muted)]'>
            {description}
          </p>
          {children}
        </div>
      </section>
    </div>
  </div>
)

export default AuthLayout
