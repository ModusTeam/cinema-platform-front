import { AlertCircle, Sparkles } from 'lucide-react'

import { useLoyaltyProfile } from '@/features/loyalty/hooks/useLoyaltyProfile'
import { useLoyaltyBenefits } from '@/features/loyalty/hooks/useLoyaltyBenefits'
import { useLoyaltyAchievementsPreview } from '@/features/loyalty/hooks/useLoyaltyAchievementsPreview'
import BalanceWidget from '@/features/loyalty/components/BalanceWidget'
import TierCard from '@/features/loyalty/components/TierCard'
import BenefitsList from '@/features/loyalty/components/BenefitsList'
import PointsExpiryNotice from '@/features/loyalty/components/PointsExpiryNotice'
import BirthdayBonusBanner from '@/features/loyalty/components/BirthdayBonusBanner'
import AchievementsPreview from '@/features/loyalty/components/AchievementsPreview'
import BenefitSimulator from '@/features/loyalty/components/BenefitSimulator'

const LoyaltyDashboard = () => {
  const profileQuery = useLoyaltyProfile()
  const benefitsQuery = useLoyaltyBenefits()
  const achievementsQuery = useLoyaltyAchievementsPreview()

  const isLoading =
    profileQuery.isLoading ||
    benefitsQuery.isLoading ||
    achievementsQuery.isLoading

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='h-40 rounded-3xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
          <div className='h-40 rounded-3xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
        </div>
        <div className='h-32 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
        <div className='grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className='h-28 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none'
            />
          ))}
        </div>
      </div>
    )
  }

  if (profileQuery.error || benefitsQuery.error || achievementsQuery.error) {
    return (
      <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
        <div className='flex items-center gap-2 text-red-200'>
          <AlertCircle size={18} />
          <span className='font-semibold'>Лояльність тимчасово недоступна</span>
        </div>
        <p className='mt-2 text-sm text-red-100/80'>
          Бекенд ще не підключено. Спробуйте пізніше.
        </p>
      </div>
    )
  }

  if (!profileQuery.data) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center'>
        <Sparkles className='mx-auto h-10 w-10 text-[var(--text-muted)]' />
        <h3 className='mt-4 text-lg font-bold text-white'>Немає даних</h3>
        <p className='mt-2 text-sm text-[var(--text-muted)]'>
          Профіль лояльності зʼявиться після першого бронювання.
        </p>
      </div>
    )
  }

  const profile = profileQuery.data

  return (
    <div className='space-y-8'>
      <div className='grid gap-6 lg:grid-cols-2'>
        <BalanceWidget
          pointsBalance={profile.pointsBalance}
          updatedAt={new Date().toISOString()}
        />
        <TierCard
          tier={profile.tier}
          nextTier={profile.nextTier}
          progressPercent={profile.progressPercent}
          currentPoints={profile.pointsBalance}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <PointsExpiryNotice expiryDate={profile.pointsExpiryDate} />
        <BirthdayBonusBanner
          isBirthdayMonth={profile.isBirthdayMonth}
          bonusPoints={profile.birthdayBonusPoints}
          isClaimed={profile.birthdayBonusClaimed}
        />
      </div>

      <section className='space-y-4'>
        <div>
          <h3 className='text-lg font-bold text-white'>Переваги програми</h3>
          <p className='text-sm text-[var(--text-muted)]'>
            Усі привілеї за рівнями будуть оновлюватися.
          </p>
        </div>
        <BenefitsList benefits={benefitsQuery.data || []} />
      </section>

      {achievementsQuery.data ? (
        <AchievementsPreview data={achievementsQuery.data} />
      ) : (
        <div className='rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-[var(--text-muted)]'>
          Превʼю досягнень зʼявиться після першого бронювання.
        </div>
      )}

      <BenefitSimulator />
    </div>
  )
}

export default LoyaltyDashboard
