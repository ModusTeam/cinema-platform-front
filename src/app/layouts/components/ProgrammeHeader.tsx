import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { PresentationSwitch } from '@/features/presentation/ui/PresentationSwitch'
import { ProgrammeBrand } from './ProgrammeBrand'

export function ProgrammeHeader() {
  const { user } = useAuth()
  return (
    <header className='programme-masthead flex flex-wrap items-center gap-5 border-b-4 border-[var(--signal-blue)] bg-[var(--signal-ink)] p-4 text-[var(--signal-chalk)] [--focus-ring:var(--signal-chalk)] md:gap-6 md:px-8 md:py-[18px] min-[68.8125rem]:flex-nowrap min-[68.8125rem]:gap-12 min-[100rem]:px-[max(32px,calc((100vw-1472px)/2))]'>
      <ProgrammeBrand />
      <div className='order-3 w-full md:contents'>
        <nav
          aria-label='Головна навігація'
          className='flex min-w-0 flex-wrap items-center justify-between gap-4 font-programme-display text-[1.375rem] md:w-auto md:justify-start md:gap-6 md:text-2xl'
        >
          <a href='#programme' aria-current='page'>
            Фільми
          </a>
          <Link to='/sessions'>Розклад</Link>
          <Link to='/profile'>Квитки</Link>
        </nav>
        <div className='mt-2 flex justify-end md:hidden'>
          <PresentationSwitch appearance='new' />
        </div>
      </div>
      <div className='ml-auto flex min-w-0 items-center gap-3 text-sm md:gap-5 md:text-base'>
        <Link to={user ? '/profile' : '/auth/login'}>
          {user ? 'Кабінет' : 'Увійти'}
        </Link>
        <PresentationSwitch appearance='new' className='hidden md:block' />
      </div>
    </header>
  )
}
