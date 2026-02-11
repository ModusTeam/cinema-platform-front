import { Crown, Sparkles, CreditCard, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { AuroraText } from '../../../common/components/AuroraText'

const PromoSection = () => {
  const { user } = useAuth()

  return (
    <div className='w-full py-20 relative overflow-hidden'>
      <div className='container mx-auto px-4'>
        <div className='relative rounded-3xl bg-gradient-to-r from-[var(--bg-card)] to-[#0a0a0a] border border-white/5 px-6 py-12 md:px-16 md:py-20 shadow-2xl overflow-hidden group'>
          <div className='absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none'></div>
          <div className='absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none'></div>
          <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-5 pointer-events-none'></div>

          <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-12'>
            <div className='md:w-1/2 space-y-6 text-center md:text-left'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider'>
                <Crown size={14} />
                Cinema Club
              </div>

              <h2 className='text-3xl md:text-5xl font-black text-white leading-tight'>
                Твій персональний{' '}
                <AuroraText className='font-black'>цифровий пропуск</AuroraText>
              </h2>

              <p className='text-lg text-[var(--text-muted)] max-w-lg mx-auto md:mx-0 leading-relaxed'>
                {user
                  ? 'Всі ваші квитки, історія переглядів та улюблені жанри — в одному місці. Покажіть ваш QR-код на вході для миттєвого доступу до зали.'
                  : "Долучайтесь до спільноти кіноманів. Зберігайте історію переглядів, купуйте квитки в один клік та отримуйте доступ до закритих прем'єр."}
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2'>
                <Link
                  to={user ? '/profile' : '/auth/register'}
                  className='bg-[var(--color-primary)] text-white font-bold py-4 px-8 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2'
                >
                  <Sparkles size={20} />
                  {user ? 'Мій кабінет' : 'Стати учасником'}
                </Link>
                {!user && (
                  <Link
                    to='/auth/login'
                    className='px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-white transition-all flex items-center justify-center'
                  >
                    Увійти
                  </Link>
                )}
              </div>
            </div>

            <div className='md:w-1/2 flex justify-center perspective-[1000px]'>
              <div className='relative w-80 h-52 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform rotate-6 group-hover:rotate-3 transition-all duration-700 ease-out flex flex-col justify-between p-6 select-none hover:shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full blur-[40px] -mt-10 -mr-10'></div>

                <div className='flex justify-between items-start relative z-10'>
                  <div>
                    <span className='block text-xl font-black text-white tracking-widest italic'>
                      CINEMA.
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

                <div className='absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromoSection
