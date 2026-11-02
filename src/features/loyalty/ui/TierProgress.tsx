import { loyaltyCopy } from '../config/loyalty.copy'
import type { LoyaltyProfile } from '../model/loyalty.types'

const TierProgress = ({
  tier,
  nextTier,
}: Pick<LoyaltyProfile, 'tier' | 'nextTier'>) => (
  <div className='space-y-3 text-sm leading-relaxed'>
    {tier.id === 'gold' ? (
      <p>{loyaltyCopy.tier.maximumReached}</p>
    ) : (
      <>
        {nextTier && <p>{loyaltyCopy.tier.nextTier(nextTier.label)}</p>}
        <p className='text-[var(--account-muted)]'>
          {loyaltyCopy.tier.progressionUnavailable}
        </p>
      </>
    )}
    <p className='text-[var(--account-muted)]'>
      {loyaltyCopy.tier.qualificationNotice}
    </p>
  </div>
)
export default TierProgress
