import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const LoyaltyHistoryPage = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]'>
      <div className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.015] blur-[100px]' />

      <div className='relative mx-auto max-w-4xl space-y-12 px-4 pb-16 pt-28'>
        <Link
          to='/account/loyalty'
          className='group mb-8 flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-white'
        >
          <ArrowLeft
            size={16}
            className='transition-transform group-hover:-translate-x-1'
          />
          Назад до огляду
        </Link>

        <header className='flex flex-col gap-2'>
          <h1 className='text-3xl font-medium tracking-tight text-white md:text-4xl'>
            Історія транзакцій
          </h1>
          <p className='text-sm text-neutral-500'>
            Нарахування та використання балів лояльності
          </p>
        </header>

        <div className='rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm leading-relaxed text-neutral-400'>
          Історія балів ще не доступна в основному API. Ми залишили цю сторінку
          як безпечний fallback і підключимо реальні операції, коли backend
          додасть користувацький HTTP endpoint для транзакцій.
        </div>
      </div>
    </div>
  )
}

export default LoyaltyHistoryPage
