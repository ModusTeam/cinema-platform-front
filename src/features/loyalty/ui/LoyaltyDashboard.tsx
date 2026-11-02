import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { LOYALTY_TIER_THRESHOLDS } from '../config/loyalty'
import { createTier } from '../lib/loyalty.mappers'
import { useLoyaltyAchievementsPreview } from '../model/useLoyaltyAchievementsPreview'
import { useLoyaltyProfile } from '../model/useLoyaltyProfile'
import AchievementsPreview from './AchievementsPreview'
import MembershipCard from './MembershipCard'
import TierCard from './TierCard'

const LoyaltyDashboard = () => {
  const profileQuery = useLoyaltyProfile()
  const achievements = useLoyaltyAchievementsPreview()
  if (profileQuery.isLoading)
    return (
      <output className='block border-y border-[var(--account-rule)] py-16 text-[var(--account-muted)]'>
        Завантажуємо вашу програму лояльності…
      </output>
    )
  if (profileQuery.error)
    return (
      <UnavailableState
        className='account-state'
        title='Лояльність тимчасово недоступна'
        onRetry={() => void profileQuery.refetch()}
      />
    )
  if (!profileQuery.data)
    return (
      <EmptyState
        className='account-state'
        icon={<Sparkles className='h-12 w-12' />}
        title='Немає даних лояльності'
        description='Інформація про вашу участь у програмі поки недоступна.'
      />
    )
  const profile = profileQuery.data
  return (
    <div className='space-y-12 lg:space-y-16'>
      <div className='grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16'>
        <MembershipCard profile={profile} />
        <TierCard profile={profile} />
      </div>
      <section aria-labelledby='loyalty-levels'>
        <h2 id='loyalty-levels' className='account-subheading mb-3'>
          Рівні програми
        </h2>
        <p className='mb-6 max-w-2xl text-sm leading-relaxed text-[var(--account-muted)]'>
          Умови рівнів наведено для довідки. Поточний статус визначає програма
          лояльності.
        </p>
        <ol className='grid border-t border-[var(--account-rule)] md:grid-cols-3'>
          {(['bronze', 'silver', 'gold'] as const).map(key => {
            const tier = createTier(key)
            const current = tier.id === profile.tier.id
            const threshold =
              key === 'bronze'
                ? null
                : LOYALTY_TIER_THRESHOLDS[key === 'silver' ? 'SILVER' : 'GOLD']
            return (
              <li
                key={key}
                data-current={current}
                className='loyalty-level min-w-0 border-b border-[var(--account-rule)] py-6 md:pr-8'
              >
                <div className='flex flex-wrap items-baseline gap-3'>
                  <h3 className='type-public-section'>{tier.label}</h3>
                  {current && (
                    <span className='text-sm underline underline-offset-4'>
                      Ваш рівень
                    </span>
                  )}
                </div>
                <p className='mt-3 text-sm leading-relaxed text-[var(--account-muted)]'>
                  {threshold
                    ? `За рік: ${threshold.points.toLocaleString('uk-UA')} нарахованих балів або ${threshold.visits} візитів.`
                    : 'Базовий рівень участі у програмі.'}
                </p>
              </li>
            )
          })}
        </ol>
      </section>
      <section aria-labelledby='loyalty-achievements'>
        <div className='mb-6 flex flex-wrap items-baseline justify-between gap-4'>
          <h2 id='loyalty-achievements' className='account-subheading'>
            Ваша колекція досягнень
          </h2>
          <Link
            to='/profile/achievements'
            className='account-link inline-flex min-h-11 items-center gap-2 text-sm'
          >
            Усі досягнення <ArrowRight size={16} aria-hidden='true' />
          </Link>
        </div>
        {achievements.isLoading ? (
          <output>Завантажуємо досягнення…</output>
        ) : achievements.error ? (
          <UnavailableState
            className='account-state'
            title='Досягнення тимчасово недоступні'
            onRetry={() => void achievements.refetch()}
          />
        ) : achievements.data ? (
          <AchievementsPreview data={achievements.data} />
        ) : (
          <p className='text-sm text-[var(--account-muted)]'>
            Досягнення поки недоступні.
          </p>
        )}
      </section>
    </div>
  )
}
export default LoyaltyDashboard
