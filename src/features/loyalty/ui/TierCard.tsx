import { loyaltyCopy } from '../config/loyalty.copy'
import type { LoyaltyProfile, LoyaltyTier } from '../model/loyalty.types'
import TierProgress from './TierProgress'

const TierCard = ({
  tier,
  profile,
}: {
  tier: LoyaltyTier
  profile: LoyaltyProfile
}) => (
  <section className='min-w-0' aria-label='Рівень учасника'>
    <div className='mb-7 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--account-rule)] pb-5'>
      <h2 className='account-subheading'>Ваш рівень</h2>
      <span className='text-sm'>{tier.label}</span>
    </div>
    <TierProgress
      progressPercent={profile.progressPercent}
      currentPoints={profile.pointsBalance}
      nextTierLabel={profile.nextTier?.label}
      nextTierPoints={profile.nextTier?.minPoints}
    />
    <ul className='mt-6 space-y-2 text-sm leading-relaxed text-[var(--account-muted)]'>
      {tier.benefits.map(benefit => (
        <li key={benefit}>{benefit}</li>
      ))}
    </ul>
    {profile.goldUpgradeAvailable && tier.id !== 'gold' && (
      <p className='mt-5 text-sm'>{loyaltyCopy.tier.goldUpgradeAvailable}</p>
    )}
    <dl className='mt-8 grid grid-cols-2 gap-5 border-t border-[var(--account-rule)] pt-5 text-sm'>
      <div>
        <dt className='account-label'>Балів цього року</dt>
        <dd className='mt-2 text-2xl tabular-nums'>
          {profile.yearPoints.toLocaleString('uk-UA')}
        </dd>
      </div>
      <div>
        <dt className='account-label'>Візитів цього року</dt>
        <dd className='mt-2 text-2xl tabular-nums'>{profile.yearVisits}</dd>
      </div>
    </dl>
    {profile.tierExpiresAt && (
      <p className='mt-5 text-xs text-[var(--account-muted)]'>
        Статус активний до{' '}
        <time dateTime={profile.tierExpiresAt}>
          {new Date(profile.tierExpiresAt).toLocaleDateString('uk-UA')}
        </time>
      </p>
    )}
  </section>
)
export default TierCard
