import AchievementsPreview from '@/features/loyalty/components/AchievementsPreview'
import BalanceWidget from '@/features/loyalty/components/BalanceWidget'
import TierCard from '@/features/loyalty/components/TierCard'
import { useLoyaltyAchievementsPreview } from '@/features/loyalty/hooks/useLoyaltyAchievementsPreview'
import { useLoyaltyProfile } from '@/features/loyalty/hooks/useLoyaltyProfile'
import { AlertCircle, Sparkles } from 'lucide-react'

const LoyaltyDashboard = () => {
  const profileQuery = useLoyaltyProfile()
  const achievementsQuery = useLoyaltyAchievementsPreview()

  const errorMessage =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : 'Помилка завантаження'

  if (profileQuery.isLoading) {
    return (
      <div className='space-y-16'>
        <div className='flex flex-col gap-12 md:flex-row md:gap-8'>
          <div className='h-24 flex-1 rounded bg-white/5 motion-safe:animate-pulse' />
          <div className='hidden h-24 w-px bg-white/5 md:block' />
          <div className='h-24 flex-1 rounded bg-white/5 motion-safe:animate-pulse' />
        </div>
        <div className='h-px w-full bg-white/5' />
        <div className='h-32 rounded bg-white/5 motion-safe:animate-pulse' />
      </div>
    )
  }

  if (profileQuery.error) {
    return (
      <div className='border-l-2 border-red-500/50 py-2 pl-4'>
        <div className='flex items-center gap-2 text-red-400'>
          <AlertCircle size={18} />
          <span className='font-medium'>Лояльність тимчасово недоступна</span>
        </div>
        <p className='mt-2 text-sm text-neutral-400'>{errorMessage}</p>
      </div>
    )
  }

  if (!profileQuery.data) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <Sparkles className='h-8 w-8 text-neutral-600' />
        <h3 className='mt-4 text-lg font-medium text-white'>Немає даних</h3>
        <p className='mt-2 text-sm text-neutral-500'>
          Профіль лояльності зʼявиться після першого бронювання.
        </p>
      </div>
    )
  }

  const profile = profileQuery.data

  return (
    <div className='relative space-y-16'>
      <div
        className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] transition-colors duration-1000'
        style={{ backgroundColor: profile.tier.badgeColor }}
      />

      <div className='flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8'>
        <div className='flex-1'>
          <BalanceWidget pointsBalance={profile.pointsBalance} />
        </div>
        <div className='hidden h-24 w-px bg-white/5 md:block' />
        <div className='flex-1'>
          <TierCard tier={profile.tier} profile={profile} />
        </div>
      </div>

      <div className='border-y border-white/5 py-8 text-sm text-neutral-500'>
        Детальна історія балів, термін дії та святкові бонуси зʼявляться тут,
        коли основний API відкриє ці дані для користувача.
      </div>

      <div className='flex flex-col gap-12 md:flex-row md:justify-between'>
        <div className='md:w-64 md:shrink-0 md:pt-8'>
          {achievementsQuery.isLoading ? (
            <span className='text-sm text-neutral-600'>
              Завантажуємо досягнення...
            </span>
          ) : achievementsQuery.error ? (
            <span className='text-sm text-neutral-600'>
              Досягнення тимчасово недоступні.
            </span>
          ) : achievementsQuery.data ? (
            <AchievementsPreview data={achievementsQuery.data} />
          ) : (
            <span className='text-sm text-neutral-600'>
              Досягнення зʼявляться згодом.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoyaltyDashboard
