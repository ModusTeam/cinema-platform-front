import {
  Armchair,
  ArrowLeft,
  Award,
  Calendar,
  Cpu,
  Film,
  LayoutDashboard,
  Menu,
  Monitor,
  Settings,
  Sword,
  Tag,
  Ticket,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAdminViewport } from '@/features/admin/model/useAdminViewport'
import { cn } from '@/shared/lib/utils'
import Button, { buttonStyles } from '@/shared/ui/Button'
import { GridLoader } from '@/shared/ui/GridLoader'
import { useModalFocus } from '@/shared/ui/modals/useModalFocus'
import '../styles/admin.css'

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

const AdminWorkspace = ({ isDesktop }: { isDesktop: boolean }) => {
  const location = useLocation()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const closeNav = () => setIsNavOpen(false)
  const isDrawerOpen = !isDesktop && isNavOpen
  useModalFocus(navRef, isDrawerOpen, closeNav)
  useLayoutEffect(() => {
    if (isDesktop) setIsNavOpen(false)
  }, [isDesktop])

  return (
    <div className='admin-workspace min-h-dvh bg-[var(--bg-main)] text-[var(--text-main)]'>
      <a
        href='#admin-content'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-[var(--bg-card)] focus:p-3'
      >
        До вмісту
      </a>
      {!isDesktop && (
        <div className='flex items-center justify-between gap-4 border-b border-[var(--border-default)] px-6 py-3'>
          <Link to='/' className='text-lg font-semibold tracking-tight'>
            Cinema<span className='text-[var(--color-primary)]'>.</span>
          </Link>
          <Button
            variant='ghost'
            aria-expanded={isDrawerOpen}
            aria-controls='admin-navigation'
            onClick={() => setIsNavOpen(true)}
          >
            <Menu size={18} aria-hidden='true' /> Меню
          </Button>
        </div>
      )}
      {isDrawerOpen && (
        <div className='fixed inset-0 z-40 bg-black/70' aria-hidden='true' />
      )}
      {/* aria-modal is supplied only while this landmark has the dialog role. */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: The tablet drawer dynamically becomes a modal dialog. */}
      <div
        ref={navRef}
        id='admin-navigation'
        role={isDrawerOpen ? 'dialog' : 'complementary'}
        aria-modal={isDrawerOpen ? true : undefined}
        aria-label='Навігація адмінпанелі'
        tabIndex={isDrawerOpen ? -1 : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[var(--border-default)] bg-[var(--surface-muted)]',
          !isDesktop && !isNavOpen && 'hidden',
        )}
      >
        <div className='flex min-h-20 shrink-0 items-center justify-between gap-2 px-5'>
          <Link to='/' className='text-xl font-semibold tracking-tight'>
            Cinema<span className='text-[var(--color-primary)]'>.</span>
            <span className='ml-2 text-xs font-normal text-[var(--text-faint)]'>
              Admin
            </span>
          </Link>
          {!isDesktop && (
            <Button
              variant='ghost'
              className='w-11 px-0'
              aria-label='Закрити меню'
              onClick={closeNav}
            >
              <X size={18} />
            </Button>
          )}
        </div>
        <nav
          aria-label='Адміністрування'
          className='min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-4'
        >
          {MENU_ITEMS.map(item => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeNav}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors motion-reduce:transition-none',
                  isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-main)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]',
                )}
              >
                <item.icon
                  size={17}
                  aria-hidden='true'
                  className={cn(
                    'shrink-0',
                    isActive && 'text-[var(--color-primary)]',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className='shrink-0 border-t border-[var(--border-default)] p-3'>
          <Link
            to='/profile'
            className='flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
          >
            <ArrowLeft size={17} aria-hidden='true' />
            Назад у профіль
          </Link>
        </div>
      </div>
      <main
        id='admin-content'
        tabIndex={-1}
        className={cn(
          'min-w-0 px-6 py-8 xl:px-10 xl:py-10',
          isDesktop && 'ml-56',
        )}
      >
        <div className='mx-auto min-w-0 max-w-[1600px]'>
          <Suspense
            fallback={
              <output className='flex h-[50vh] items-center justify-center'>
                <GridLoader
                  aria-hidden='true'
                  className='h-8 w-8 animate-spin motion-reduce:animate-none text-[var(--text-muted)]'
                />
                <span className='sr-only'>Завантаження розділу</span>
              </output>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

const AdminLayout = () => {
  const viewport = useAdminViewport()
  if (viewport === 'unsupported') {
    return (
      <main className='font-public flex min-h-dvh items-center justify-center bg-[var(--bg-main)] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-[var(--text-main)]'>
        <div className='min-w-0 max-w-md break-words text-center'>
          <Monitor
            size={36}
            strokeWidth={1.25}
            aria-hidden='true'
            className='mx-auto mb-8 text-[var(--text-faint)]'
          />
          <h1 className='text-2xl font-medium leading-tight tracking-tight'>
            Адмінпанель недоступна
          </h1>
          <p className='mt-4 text-base leading-relaxed text-[var(--text-muted)]'>
            Для комфортної роботи використовуйте планшет або комп'ютер з шириною
            екрана від 768 px.
          </p>
          <Link to='/' className={cn(buttonStyles('secondary'), 'mt-8')}>
            На головну
          </Link>
        </div>
      </main>
    )
  }
  return <AdminWorkspace isDesktop={viewport === 'desktop'} />
}

export default AdminLayout
