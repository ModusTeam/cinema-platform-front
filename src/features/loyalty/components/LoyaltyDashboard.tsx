import AchievementsPreview from '@/features/loyalty/components/AchievementsPreview'
import BalanceWidget from '@/features/loyalty/components/BalanceWidget'
import TierCard from '@/features/loyalty/components/TierCard'
import { useLoyaltyAchievementsPreview } from '@/features/loyalty/hooks/useLoyaltyAchievementsPreview'
import { useLoyaltyProfile } from '@/features/loyalty/hooks/useLoyaltyProfile'
import {
  AlertCircle,
  CalendarClock,
  Gift,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const formatDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

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
  const balanceExpiresAt = formatDate(profile.balanceExpiresAt)
  const tierExpiresAt = formatDate(profile.tierExpiresAt)
  const nearestAchievement = achievementsQuery.data?.items.find(
    achievement => achievement.status === 'in-progress',
  )
  const nextStepText = nearestAchievement
    ? `Найближче досягнення: ${nearestAchievement.title} (${nearestAchievement.current}/${nearestAchievement.target}).`
    : profile.nextTier
      ? `Продовжуйте бронювання, щоб наблизитися до рівня ${profile.nextTier.label}.`
      : 'Підтримуйте активність, щоб зберегти переваги Gold.'
  const notices = [
    profile.isBirthdayWeek
      ? 'Триває ваш святковий тиждень: перевіряйте бонуси під час бронювання.'
      : null,
    profile.goldUpgradeAvailable
      ? 'Для цього замовлення може бути доступне підвищення до Gold.'
      : null,
    balanceExpiresAt ? `Баланс балів активний до ${balanceExpiresAt}.` : null,
    tierExpiresAt ? `Поточний статус діє до ${tierExpiresAt}.` : null,
  ].filter(Boolean)

  return (
    <div className='relative space-y-10'>
      <div
        className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] transition-colors duration-1000'
        style={{ backgroundColor: profile.tier.badgeColor }}
      />

      <div className='grid grid-cols-1 gap-3 border-y border-white/5 py-4 sm:grid-cols-3'>
        <div>
          <span className='text-xs tracking-widest text-neutral-500 uppercase'>
            Всього зароблено
          </span>
          <strong className='mt-1 block text-lg font-medium text-white'>
            {profile.lifetimePoints}
          </strong>
        </div>
        <div>
          <span className='text-xs tracking-widest text-neutral-500 uppercase'>
            Цього року
          </span>
          <strong className='mt-1 block text-lg font-medium text-white'>
            {profile.yearPoints} балів
          </strong>
        </div>
        <div>
          <span className='text-xs tracking-widest text-neutral-500 uppercase'>
            Візити
          </span>
          <strong className='mt-1 block text-lg font-medium text-white'>
            {profile.yearVisits}
          </strong>
        </div>
      </div>

      <div className='flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-8'>
        <div className='flex-1'>
          <BalanceWidget pointsBalance={profile.pointsBalance} />
        </div>
        <div className='hidden h-24 w-px bg-white/5 md:block' />
        <div className='flex-1'>
          <TierCard tier={profile.tier} profile={profile} />
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-[1.4fr_1fr]'>
        <div className='rounded-lg border border-white/5 bg-white/[0.02] p-4'>
          <div className='flex items-center gap-2 text-sm font-medium text-white'>
            <Trophy className='h-4 w-4 text-[var(--color-primary)]' />
            Що далі
          </div>
          <p className='mt-2 text-sm leading-relaxed text-neutral-400'>
            {nextStepText}
          </p>
        </div>

        <div className='rounded-lg border border-white/5 bg-white/[0.02] p-4'>
          <div className='flex items-center gap-2 text-sm font-medium text-white'>
            <CalendarClock className='h-4 w-4 text-neutral-400' />
            Важливе
          </div>
          {notices.length > 0 ? (
            <ul className='mt-2 space-y-1.5 text-sm text-neutral-400'>
              {notices.map(notice => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          ) : (
            <p className='mt-2 text-sm text-neutral-500'>
              Немає термінових повідомлень щодо балів або статусу.
            </p>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between'>
        <div>
          {achievementsQuery.isLoading ? (
            <div className='h-9 w-64 rounded-full bg-white/5 motion-safe:animate-pulse' />
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
        <Link
          to='/account/loyalty/history'
          className='flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white'
        >
          <Gift className='h-4 w-4' />
          Історія балів
        </Link>
      </div>
    </div>
  )
}

export default LoyaltyDashboard
