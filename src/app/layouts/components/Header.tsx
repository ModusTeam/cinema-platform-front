import { AnimatePresence } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { cn } from '@/shared/lib/utils'
import TicketMenu from './TicketMenu'
import './navigation.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 20)
  const { user, logout } = useAuth()
  const location = useLocation()
  const menuId = useId()
  const headerRef = useRef<HTMLElement>(null)
  const isHome = location.pathname === '/'

  // biome-ignore lint/correctness/useExhaustiveDependencies: Every navigation, including history and hash changes, dismisses the menu.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    // Enlarged text can wrap the fixed header onto another row.
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--public-header-height',
        `${header.getBoundingClientRect().height}px`,
      )
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--public-header-height')
    }
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        data-header-surface={isHome && !isScrolled ? 'hero' : 'solid'}
        className={cn(
          'cinema-header fixed inset-x-0 top-0 z-60 font-public text-[var(--header-ink)] transition-colors duration-200 motion-reduce:transition-none',
          isHome && !isScrolled
            ? 'bg-[linear-gradient(to_bottom,rgba(12,12,14,.82),rgba(12,12,14,.64)_75%,transparent)]'
            : 'bg-[var(--header-surface)]',
        )}
      >
        <div className='cinema-header-inner mx-auto flex min-h-20 max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8'>
          <nav
            aria-label='Швидка навігація'
            className='hidden items-center gap-6 md:flex'
          >
            <NavLink
              to='/'
              end
              className='header-link inline-flex min-h-11 min-w-11 items-center text-sm'
            >
              Афіша
            </NavLink>
            <NavLink
              to='/sessions?mode=schedule'
              className='header-link inline-flex min-h-11 min-w-11 items-center text-sm'
            >
              Сеанси
            </NavLink>
          </nav>
          <Link
            to='/'
            aria-label='Cinema — на головну'
            className='w-fit py-2 font-sans text-2xl font-black uppercase tracking-tighter md:text-3xl'
          >
            Cine<span className='text-[var(--color-primary)]'>ma</span>.
          </Link>
          <div className='flex items-center justify-end gap-6'>
            <Link
              to={user ? '/profile' : '/auth/login'}
              className='header-link hidden min-h-11 min-w-11 items-center text-sm md:inline-flex'
            >
              {user ? 'Кабінет' : 'Увійти'}
            </Link>
            <button
              type='button'
              onClick={() => setIsMenuOpen(true)}
              aria-label='Відкрити меню'
              aria-haspopup='dialog'
              aria-expanded={isMenuOpen}
              aria-controls={isMenuOpen ? menuId : undefined}
              className='ticket-menu-trigger group flex min-h-11 items-center gap-3 px-4 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'
            >
              Меню
              <span aria-hidden='true' className='flex w-4 flex-col gap-1.5'>
                <span className='h-px w-4 bg-current' />
                <span className='h-px w-3 bg-current motion-safe:transition-[width] motion-safe:duration-150 group-hover:w-4' />
              </span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMenuOpen && (
          <TicketMenu
            key={menuId}
            id={menuId}
            user={user}
            onClose={() => setIsMenuOpen(false)}
            onLogout={() => {
              setIsMenuOpen(false)
              logout()
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
