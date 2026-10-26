import { CreditCard, Crown, QrCode, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { buttonStyles } from '@/shared/ui/Button'

const PromoSection = () => {
  const { user } = useAuth()

  return (
    <div className='w-full py-20 relative overflow-hidden'>
      <div className='container mx-auto px-4'>
        <div className='relative rounded-3xl bg-[var(--surface-muted)] border border-[var(--border-default)] px-6 py-12 md:px-16 md:py-20 overflow-hidden group'>
          <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-12'>
            <div className='md:w-1/2 space-y-6 text-center md:text-left'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold normal-case tracking-wider'>
                <Crown size={14} />
                vespre. Club
              </div>

              <h2 className='type-display text-3xl sm:text-3xl md:text-5xl text-white leading-tight'>
                Твій персональний{' '}
                <span className='text-[var(--color-primary)]'>
                  цифровий пропуск
                </span>
              </h2>

              <p className='text-lg text-[var(--text-muted)] max-w-lg mx-auto md:mx-0 leading-relaxed'>
                {user
                  ? 'Всі ваші квитки, історія переглядів та улюблені жанри — в одному місці. Покажіть ваш QR-код на вході для миттєвого доступу до зали.'
                  : "Долучайтесь до спільноти кіноманів. Зберігайте історію переглядів, купуйте квитки в один клік та отримуйте доступ до закритих прем'єр."}
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2'>
                <Link
                  to={user ? '/profile' : '/auth/register'}
                  className={`${buttonStyles()} py-4 px-8`}
                >
                  <Sparkles size={20} />
                  {user ? 'Мій кабінет' : 'Стати учасником'}
                </Link>
                {!user && (
                  <Link
                    to='/auth/login'
                    className={`${buttonStyles('secondary')} px-8 py-4`}
                  >
                    Увійти
                  </Link>
                )}
              </div>
            </div>

            <div className='md:w-1/2 flex justify-center perspective-[1000px]'>
              <div className='relative w-80 max-w-full h-52 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-lg motion-safe:rotate-6 motion-safe:group-hover:rotate-3 transition-transform duration-200 ease-out flex flex-col justify-between p-6 select-none overflow-hidden'>
                <div className='flex justify-between items-start relative z-10'>
                  <div>
                    <span className='block text-xl font-black text-white tracking-widest italic'>
                      vespre.
                    </span>
                    <span className='block text-[10px] font-bold text-[var(--text-muted)] tracking-[0.3em] uppercase mt-1'>
                      Official Member
                    </span>
                  </div>
                  <div className='w-10 h-8 rounded bg-gradient-to-br from-yellow-200 to-yellow-600 flex items-center justify-center opacity-90 shadow-sm border border-yellow-400/50'>
                    <CreditCard
                      size={16}
                      className='text-yellow-900 opacity-50'
                    />
                  </div>
                </div>

                <div className='flex items-center gap-4 relative z-10'>
                  <div className='text-2xl tracking-[0.15em] font-mono text-zinc-400/50 font-bold'>
                    •••• •••• ••••
                  </div>
                </div>

                <div className='flex justify-between items-end relative z-10'>
                  <div className='space-y-0.5'>
                    <div className='text-[9px] text-[var(--text-muted)] uppercase tracking-wider'>
                      Card Holder
                    </div>
                    <div className='text-sm font-bold text-white tracking-wider uppercase font-mono'>
                      {user ? `${user.name} ${user.surname}` : 'GUEST USER'}
                    </div>
                  </div>
                  <div className='text-white/80'>
                    <QrCode size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromoSection
