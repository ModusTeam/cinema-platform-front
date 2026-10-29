import { X } from 'lucide-react'
import { motion, useIsPresent } from 'motion/react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import type { User } from '@/features/auth/model/auth.types'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import { useModalFocus } from '@/shared/ui/modals/useModalFocus'
import { PRIMARY_NAV_ITEMS } from './navigation.config'

interface TicketMenuProps {
  id: string
  user: User | null
  onClose: () => void
  onLogout: () => void
}

const TicketMenu = ({ id, user, onClose, onLogout }: TicketMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPresent = useIsPresent()
  const reducedMotion = useMotionPreference()
  useModalFocus(containerRef, isPresent, onClose)
  const duration = reducedMotion ? 0 : 0.24

  return createPortal(
    <motion.div
      ref={containerRef}
      id={id}
      role='dialog'
      aria-modal='true'
      aria-label='Головне меню'
      aria-hidden={!isPresent}
      inert={!isPresent}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className='ticket-menu fixed inset-0 z-[80] flex justify-end font-public selection:bg-[var(--ticket-rule)]'
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      data-lenis-prevent
    >
      <button
        type='button'
        tabIndex={-1}
        aria-label='Закрити меню поза квитком'
        onClick={onClose}
        className='absolute inset-0 cursor-default bg-black/65'
      />
      <motion.div
        initial={reducedMotion ? false : { y: -12, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={reducedMotion ? {} : { y: -8, scale: 0.99 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        className='ticket-paper relative flex w-full max-w-[520px] origin-top-right flex-col self-start text-[var(--ticket-ink)]'
      >
        <div className='ticket-perforation relative flex shrink-0 items-stretch'>
          <div className='ticket-menu-brand flex min-w-0 flex-1 items-center justify-between gap-4 py-5'>
            <span className='font-sans text-xl font-black uppercase tracking-tighter'>
              Cinema.
            </span>
            <span className='hidden text-xs text-[var(--ticket-muted)] sm:inline'>
              Кіно починається тут
            </span>
          </div>
          <button
            type='button'
            aria-label='Закрити меню'
            data-modal-initial-focus
            onClick={onClose}
            className='ticket-close flex min-h-20 shrink-0 items-center justify-center border-l border-dashed border-[var(--ticket-rule)] transition-colors duration-150 hover:bg-[var(--ticket-hover)] motion-reduce:transition-none'
          >
            <X size={28} strokeWidth={1.25} aria-hidden='true' />
          </button>
        </div>
        <div className='ticket-menu-content min-h-0 overflow-y-auto overscroll-contain pb-6 pt-5 sm:pb-8'>
          <nav aria-label='Головна навігація'>
            <ol>
              {PRIMARY_NAV_ITEMS.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.18,
                    delay: reducedMotion ? 0 : index * 0.025,
                  }}
                >
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    onClick={onClose}
                    className='ticket-nav-link group flex min-h-14 items-baseline gap-4 py-1.5 sm:min-h-16 sm:gap-6'
                  >
                    <span
                      aria-hidden='true'
                      className='w-5 shrink-0 text-xs tabular-nums text-[var(--ticket-muted)]'
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className='min-w-0 break-words font-[family-name:var(--font-public-display)] text-[clamp(2rem,6vw,3rem)] font-semibold leading-[1.15] tracking-tight uppercase motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-1'>
                      {item.label}
                    </span>
                  </NavLink>
                </motion.li>
              ))}
            </ol>
          </nav>
          <div className='mt-5 border-t border-dashed border-[var(--ticket-rule)] pt-4'>
            {user ? (
              <>
                <p className='mb-2 break-words text-sm text-[var(--ticket-muted)]'>
                  {user.name} {user.surname}
                </p>
                <div className='flex flex-wrap items-center justify-between gap-x-6'>
                  <Link
                    to='/profile'
                    onClick={onClose}
                    className='ticket-text-link inline-flex min-h-11 items-center text-base font-medium'
                  >
                    Кабінет і квитки
                  </Link>
                  <button
                    type='button'
                    onClick={onLogout}
                    className='ticket-text-link min-h-11 text-sm'
                  >
                    Вийти
                  </button>
                </div>
              </>
            ) : (
              <div className='flex flex-wrap items-center justify-between gap-x-6'>
                <Link
                  to='/auth/login'
                  onClick={onClose}
                  className='ticket-text-link inline-flex min-h-11 items-center text-base font-medium'
                >
                  Увійти
                </Link>
                <Link
                  to='/auth/register'
                  onClick={onClose}
                  className='ticket-text-link inline-flex min-h-11 items-center text-sm'
                >
                  Зареєструватися
                </Link>
              </div>
            )}
          </div>
          <div className='mt-4 border-t border-dashed border-[var(--ticket-rule)] pt-3 text-xs text-[var(--ticket-muted)]'>
            <Link
              to='/faq'
              onClick={onClose}
              className='ticket-text-link inline-flex min-h-11 items-center text-sm'
            >
              Допомога
            </Link>
            <div className='flex flex-wrap gap-x-6'>
              <a
                href='tel:0800500500'
                className='ticket-text-link inline-flex min-h-11 items-center'
              >
                0 800 500 500
              </a>
              <a
                href='mailto:support@cinema.ua'
                className='ticket-text-link inline-flex min-h-11 items-center'
              >
                support@cinema.ua
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export default TicketMenu
