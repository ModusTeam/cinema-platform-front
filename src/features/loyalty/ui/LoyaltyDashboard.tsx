import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import AchievementCard from '../achievements/AchievementCard'
import { createTier } from '../lib/loyalty.mappers'
import { useLoyaltyAchievementsPreview } from '../model/useLoyaltyAchievementsPreview'
import { useLoyaltyProfile } from '../model/useLoyaltyProfile'
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
        onRetry={() => {
          void profileQuery.refetch()
        }}
      />
    )
  if (!profileQuery.data)
    return (
      <EmptyState
        className='account-state'
        icon={<Sparkles className='h-12 w-12' />}
        title='Немає даних лояльності'
        description='Профіль лояльності зʼявиться після першого бронювання.'
      />
    )
  const profile = profileQuery.data
  const nearest = achievements.data?.items.find(
    item => item.status === 'in-progress' && !item.isSecret,
  )
  return (
    <div className='space-y-12 lg:space-y-16'>
      <div className='grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16'>
        <section
          aria-label='Картка учасника'
          className='membership-card min-w-0 self-start bg-[var(--bg-main)] p-6 text-[var(--text-main)] sm:p-8'
        >
          <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-default)] pb-5'>
            <span className='text-xl font-semibold tracking-tight'>
              Cinema<span className='text-[var(--color-primary)]'>.</span>
            </span>
            <span className='text-sm text-[var(--text-muted)]'>
              Картка учасника
            </span>
          </div>
          <h2 className='mt-9 font-[family-name:var(--font-public-display)] text-5xl leading-none sm:text-6xl'>
            {profile.tier.label}
          </h2>
          <dl className='mt-9 border-t border-[var(--border-default)] pt-5'>
            <dt className='text-sm text-[var(--text-muted)]'>Доступні бали</dt>
            <dd className='mt-2 flex flex-wrap items-baseline gap-3'>
              <strong className='text-4xl font-medium tabular-nums sm:text-5xl'>
                {profile.pointsBalance.toLocaleString('uk-UA')}
              </strong>
              <span className='text-sm text-[var(--text-muted)]'>балів</span>
            </dd>
          </dl>
          {profile.balanceExpiresAt && (
            <p className='mt-5 text-xs text-[var(--text-muted)]'>
              Термін дії балів:{' '}
              <time dateTime={profile.balanceExpiresAt}>
                {new Date(profile.balanceExpiresAt).toLocaleDateString('uk-UA')}
              </time>
            </p>
          )}
          <Link
            to='/account/loyalty/history'
            className='mt-7 inline-flex min-h-11 items-center gap-3 text-sm underline underline-offset-4'
          >
            Історія балів <ArrowRight size={16} aria-hidden='true' />
          </Link>
        </section>
        <TierCard tier={profile.tier} profile={profile} />
      </div>
      <section aria-labelledby='loyalty-levels'>
        <h2 id='loyalty-levels' className='account-subheading mb-6'>
          Рівні програми
        </h2>
        <div className='grid border-t border-[var(--account-rule)] md:grid-cols-3'>
          {(['bronze', 'silver', 'gold'] as const).map(key => {
            const tier = createTier(key)
            return (
              <div
                key={key}
                className='border-b border-[var(--account-rule)] py-6 md:pr-8'
              >
                <div className='flex flex-wrap items-baseline gap-3'>
                  <h3 className='type-public-section'>{tier.label}</h3>
                  {tier.id === profile.tier.id && (
                    <span className='account-label'>Ваш рівень</span>
                  )}
                </div>
                <p className='mt-3 text-sm tabular-nums'>
                  {tier.minPoints.toLocaleString('uk-UA')} балів — поріг рівня
                </p>
                <ul className='mt-3 space-y-2 text-sm leading-relaxed text-[var(--account-muted)]'>
                  {tier.benefits.map(benefit => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
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
            onRetry={() => {
              void achievements.refetch()
            }}
          />
        ) : (
          <>
            {achievements.data && (
              <p className='mb-6 text-sm text-[var(--account-muted)]'>
                Відкрито {achievements.data.totalUnlocked} з{' '}
                {achievements.data.totalAvailable}
              </p>
            )}
            {nearest ? (
              <AchievementCard achievement={nearest} featured />
            ) : (
              <p className='border-t border-[var(--account-rule)] py-6 text-sm text-[var(--account-muted)]'>
                Усі доступні досягнення вже відкрито або вони зʼявляться згодом.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
export default LoyaltyDashboard
