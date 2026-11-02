import { loyaltyCopy } from '../config/loyalty.copy'
import { formatLoyaltyDate } from '../lib/loyaltyDate'
import type { LoyaltyProfile } from '../model/loyalty.types'
import TierProgress from './TierProgress'

const TierCard = ({ profile }: { profile: LoyaltyProfile }) => {
  const expires = formatLoyaltyDate(profile.tierExpiresAt)
  return (
    <section className='min-w-0' aria-labelledby='loyalty-status'>
      <h2 id='loyalty-status' className='account-subheading mb-6'>
        Участь у програмі
      </h2>
      <TierProgress tier={profile.tier} nextTier={profile.nextTier} />
      {expires && (
        <p className='mt-5 text-sm text-[var(--account-muted)]'>
          Термін дії статусу:{' '}
          <time dateTime={profile.tierExpiresAt ?? undefined}>{expires}</time>
        </p>
      )}
      {profile.goldUpgradeAvailable && profile.tier.id === 'gold' && (
        <p className='mt-5 border-t border-[var(--account-rule)] pt-5 text-sm leading-relaxed'>
          {loyaltyCopy.tier.goldUpgradeAvailable}
        </p>
      )}
      <dl className='mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-6 border-t border-[var(--account-rule)] pt-5'>
        <div>
          <dt className='text-sm text-[var(--account-muted)]'>
            {loyaltyCopy.tier.pointsThisYear}
          </dt>
          <dd className='mt-2 text-3xl tabular-nums'>
            {profile.yearPoints?.toLocaleString('uk-UA') ?? 'Немає даних'}
          </dd>
        </div>
        <div>
          <dt className='text-sm text-[var(--account-muted)]'>
            {loyaltyCopy.tier.visitsThisYear}
          </dt>
          <dd className='mt-2 text-3xl tabular-nums'>
            {profile.yearVisits?.toLocaleString('uk-UA') ?? 'Немає даних'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
export default TierCard
