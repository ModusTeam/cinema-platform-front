import {
  Armchair,
  ArrowLeft,
  Award,
  Calendar,
  Cpu,
  Film,
  LayoutDashboard,
  Settings,
  Sword,
  Tag,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react'
import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { GridLoader } from '@/shared/ui/GridLoader'

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Дашборд', href: '/admin' },
  { icon: Film, label: 'Фільми', href: '/admin/movies' },
  { icon: Calendar, label: 'Сеанси', href: '/admin/sessions' },
  { icon: Users, label: 'Користувачі', href: '/admin/users' },
  { icon: Award, label: 'Лояльність', href: '/admin/loyalty' },
  { icon: Trophy, label: 'Досягнення', href: '/admin/achievements' },
  { icon: Armchair, label: 'Зали', href: '/admin/halls' },
  { icon: Cpu, label: 'Технології', href: '/admin/technologies' },
  { icon: Tag, label: 'Тарифи', href: '/admin/pricings' },
  {
    icon: Ticket,
    label: 'Активність користувачів',
    href: '/admin/user-activity',
  },
  { icon: Sword, label: 'Жанри', href: '/admin/genres' },
  { icon: Settings, label: 'Налаштування', href: '/profile' },
]

const AdminLayout = () => {
  const location = useLocation()

  return (
    <div className='flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-[var(--color-primary)]/30'>
      <aside className='fixed left-0 top-0 z-40 flex h-dvh w-44 lg:w-64 flex-col border-r border-white/5 bg-[var(--bg-card)]'>
        <div className='flex h-16 shrink-0 items-center px-3 lg:px-6 border-b border-white/5'>
          <Link
            to='/'
            className='text-xl font-bold tracking-tighter uppercase text-white'
          >
            Cinema<span className='text-[var(--color-primary)]'>.</span>{' '}
            <span className='text-xs text-[var(--text-muted)] ml-1'>Admin</span>
          </Link>
        </div>

        <nav
          aria-label='Адміністрування'
          className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-2 lg:p-4'
        >
          {MENU_ITEMS.map(item => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 lg:px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
                    : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} className='shrink-0' aria-hidden='true' />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className='w-full shrink-0 p-2 lg:p-4 border-t border-white/5'>
          <Link
            to='/profile'
            className='flex w-full items-center gap-3 rounded-lg px-3 lg:px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-white'
          >
            <ArrowLeft size={18} className='shrink-0' aria-hidden='true' />
            Назад у Профіль
          </Link>
        </div>
      </aside>

      <main className='ml-44 lg:ml-64 min-w-0 flex-1 p-4 lg:p-8'>
        <Suspense
          fallback={
            <div className='flex h-[50vh] w-full items-center justify-center'>
              <GridLoader className='animate-spin text-[var(--color-primary)] h-10 w-10' />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

export default AdminLayout
