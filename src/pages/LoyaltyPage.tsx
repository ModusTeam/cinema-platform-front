import LoyaltyDashboard from '@/features/loyalty/components/LoyaltyDashboard'

const LoyaltyPage = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]'>
      <div className='relative mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-28'>
        <header className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-medium tracking-tight text-white md:text-4xl'>
              Loyalty & Achievements
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base'>
              Огляд балансу, рівнів та бонусів. Дані синхронізуються з вашим
              профілем лояльності.
            </p>
          </div>
        </header>

        <div className='h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent' />

        <LoyaltyDashboard />
      </div>
    </div>
  )
}

export default LoyaltyPage
