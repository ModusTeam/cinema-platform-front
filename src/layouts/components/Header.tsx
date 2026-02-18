import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { label: 'Афіша', href: '/sessions' },
  { label: 'Пропозиції', href: '/offers' },
  { label: 'Кінобар', href: '/bar' },
  { label: 'Допомога', href: '/faq' },
  { label: 'Про нас', href: '/about' },
]

const RollingText = ({ text }: { text: string }) => {
  return (
    <div className='relative overflow-hidden block h-[1.2em] leading-[1.2em]'>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className='inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full'
          style={{ transitionDelay: `${i * 25}ms` }}
        >
          <span className='block h-[1.2em]'>
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span className='block h-[1.2em] absolute top-full text-[var(--color-primary)]'>
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </div>
  )
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-[60] transition-all duration-500 border-b border-transparent',
          !isMenuOpen && isScrolled
            ? 'bg-black/60 backdrop-blur-xl border-white/5 py-3'
            : 'bg-transparent py-4 md:py-6',
        )}
      >
        <div className='container mx-auto flex items-center justify-between px-4 md:px-6'>
          <Link
            to='/'
            className='relative z-[70] flex items-center gap-1 text-2xl md:text-3xl font-black tracking-tighter text-white uppercase select-none group'
            onClick={() => setIsMenuOpen(false)}
          >
            <span>
              Cine
              <span className='text-[var(--color-primary)] transition-all duration-300 group-hover:text-white'>
                ma
              </span>
              .
            </span>
          </Link>

          <div className='relative z-[70] flex items-center gap-4 md:gap-6'>
            {!isMenuOpen && (
              <div className='hidden md:flex items-center gap-6 animate-in fade-in duration-300'>
                {user ? (
                  <Link
                    to='/profile'
                    className='flex items-center gap-3 text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors'
                  >
                    <span className='text-right leading-tight'>
                      <span className='block text-[10px] text-[var(--text-muted)] uppercase'>
                        Вітаємо
                      </span>
                      {user.name}
                    </span>
                    <div className='w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10'>
                      <User size={16} />
                    </div>
                  </Link>
                ) : (
                  <Link
                    to='/auth/login'
                    className='text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors'
                  >
                    Увійти
                  </Link>
                )}
              </div>
            )}

            <button
              type='button'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='group relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors focus:outline-none'
              aria-label='Toggle menu'
            >
              <div className='relative w-5 h-5'>
                <span
                  className={clsx(
                    'absolute top-1/2 left-0 h-0.5 w-5 bg-white transition-all duration-300 -translate-y-1.5',
                    isMenuOpen && 'translate-y-0 rotate-45',
                  )}
                />
                <span
                  className={clsx(
                    'absolute top-1/2 left-0 h-0.5 bg-white transition-all duration-300 w-3 group-hover:w-5',
                    isMenuOpen ? 'opacity-0 w-0' : 'w-3',
                  )}
                />
                <span
                  className={clsx(
                    'absolute top-1/2 left-0 h-0.5 w-5 bg-white transition-all duration-300 translate-y-1.5',
                    isMenuOpen && 'translate-y-0 -rotate-45',
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        className={clsx(
          'fixed inset-0 z-50 flex flex-col bg-[#050505]/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
          isMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none',
        )}
      >
        <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-5 pointer-events-none'></div>
        <div className='absolute top-0 right-0 w-[50vw] h-[50vh] bg-[var(--color-primary)]/10 blur-[150px] rounded-full pointer-events-none'></div>

        <div className='container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] h-full pt-28 pb-10 overflow-y-auto'>
          <nav className='flex flex-col justify-center space-y-4 lg:space-y-6 relative z-10'>
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={clsx(
                  'group flex items-center justify-between py-2 border-b border-white/5 lg:border-none lg:py-0 transition-all duration-500 ease-out',
                  isMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className='text-4xl sm:text-5xl lg:text-7xl font-black text-zinc-500 group-hover:text-white transition-colors duration-500 uppercase tracking-tight'>
                  <RollingText text={item.label} />
                </span>
                <span className='lg:hidden text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity'>
                  →
                </span>
              </Link>
            ))}
          </nav>

          <div
            className={clsx(
              'flex flex-col justify-end lg:justify-center lg:items-start lg:pl-12 lg:border-l lg:border-white/5 space-y-8 transition-all duration-700 delay-300 mt-10 lg:mt-0',
              isMenuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10',
            )}
          >
            {user ? (
              <div className='w-full'>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-xl'>
                    {user.name[0]}
                  </div>
                  <div>
                    <div className='text-[var(--text-muted)] text-xs md:text-sm uppercase tracking-wider mb-1'>
                      Залогінений як
                    </div>
                    <div className='text-lg md:text-xl font-bold text-white'>
                      {user.name} {user.surname}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <Link
                    to='/profile'
                    className='flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 md:py-4 font-bold hover:bg-zinc-200 transition-colors text-sm md:text-base'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} /> Кабінет
                  </Link>
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white py-3 md:py-4 font-bold hover:bg-white/10 transition-colors text-sm md:text-base'
                  >
                    <LogOut size={18} /> Вийти
                  </button>
                </div>
              </div>
            ) : (
              <div className='w-full p-6 md:p-8 rounded-3xl bg-white/5 border border-white/5'>
                <h3 className='text-xl md:text-2xl font-bold text-white mb-2'>
                  Приєднуйтесь до нас
                </h3>
                <p className='text-sm md:text-base text-[var(--text-muted)] mb-6'>
                  Бронюйте місця, отримуйте знижки та зберігайте історію.
                </p>
                <Link
                  to='/auth/login'
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 md:py-4 font-bold text-white shadow-lg hover:scale-[1.02] transition-transform text-sm md:text-base'
                  onClick={() => setIsMenuOpen(false)}
                >
                  Увійти або Зареєструватися
                </Link>
              </div>
            )}

            <div className='space-y-4 pt-4 lg:pt-0'>
              <div className='text-[var(--text-muted)] uppercase tracking-widest text-xs font-bold'>
                Контакти
              </div>
              <a
                href='tel:0800500500'
                className='block text-xl md:text-2xl font-mono text-white hover:text-[var(--color-primary)] transition-colors'
              >
                0 800 500 500
              </a>
              <a
                href='mailto:support@cinema.ua'
                className='block text-base md:text-lg text-white hover:text-[var(--color-primary)] transition-colors'
              >
                support@cinema.ua
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
