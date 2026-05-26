import { Sparkles } from 'lucide-react'

import { LOYALTY_TIER_THRESHOLDS } from '@/constants/loyalty'
import { getTierProgressPercent } from '@/features/loyalty/api/loyalty.mappers'
import type {
  LoyaltyProfile,
  LoyaltyTier,
} from '@/features/loyalty/api/loyalty.types'

interface TierCardProps {
  tier: LoyaltyTier
  profile: LoyaltyProfile
}

const TierCard = ({ tier, profile }: TierCardProps) => {
  const isGold = tier.id === 'gold'
  const nextTierKey =
    tier.id === 'bronze' ? 'SILVER' : tier.id === 'silver' ? 'GOLD' : null

  const thresholds = nextTierKey ? LOYALTY_TIER_THRESHOLDS[nextTierKey] : null
  const remainingPoints = thresholds
    ? Math.max(0, thresholds.points - profile.pointsBalance)
    : 0

  const progress = getTierProgressPercent(tier.id, profile.pointsBalance)
  const tierExpiry = profile.tierExpiresAt
    ? new Intl.DateTimeFormat('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(profile.tierExpiresAt))
    : null

  return (
    <div className='flex w-full flex-col gap-5 md:w-1/2'>
      <div className='flex flex-col gap-1'>
        <span className='text-sm tracking-widest text-neutral-500 uppercase'>
          Поточний статус
        </span>
        <div className='flex items-center gap-3'>
          <span
            className='h-2 w-2 rounded-full'
            style={{
              backgroundColor: tier.badgeColor,
              boxShadow: `0 0 12px ${tier.badgeColor}`,
            }}
          />
          <h2 className='text-3xl font-medium text-white'>{tier.label}</h2>
        </div>
        <p className='text-sm text-neutral-400'>
          {isGold
            ? 'У вас найвищий рівень програми.'
            : `Наступний рівень: ${profile.nextTier?.label ?? 'Gold'}.`}
        </p>
      </div>

      {profile.goldUpgradeAvailable && !isGold && (
        <div className='flex w-fit items-center gap-3 border-l-2 border-[#f59e0b] bg-[#f59e0b]/5 py-2 pl-4 pr-6'>
          <Sparkles className='h-4 w-4 shrink-0 text-[#f59e0b]' />
          <span className='text-sm font-medium text-[#f59e0b]'>
            Доступне підвищення до Gold
          </span>
        </div>
      )}

      {isGold && (
        <div className='flex w-fit items-center gap-3 border-l-2 border-[#f59e0b] bg-[#f59e0b]/5 py-2 pl-4 pr-6'>
          <Sparkles className='h-4 w-4 shrink-0 text-[#f59e0b]' />
          <span className='text-sm font-medium text-[#f59e0b]'>
            Максимальний рівень програми лояльності
          </span>
        </div>
      )}

      {thresholds && (
        <div className='flex flex-col gap-3'>
          <span className='text-xs text-neutral-400'>
            Залишилось {remainingPoints} балів до {profile.nextTier?.label}
          </span>
          <div className='h-0.5 w-full overflow-hidden rounded-full bg-white/10'>
            <div
              className='h-full bg-white transition-all duration-1000 ease-out'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-3 text-xs'>
        <div className='border-l border-white/10 pl-3'>
          <span className='block text-neutral-500'>Балів цього року</span>
          <strong className='mt-1 block text-sm font-medium text-white'>
            {profile.yearPoints}
          </strong>
        </div>
        <div className='border-l border-white/10 pl-3'>
          <span className='block text-neutral-500'>Візитів цього року</span>
          <strong className='mt-1 block text-sm font-medium text-white'>
            {profile.yearVisits}
          </strong>
        </div>
      </div>

      {tierExpiry && (
        <p className='text-xs text-neutral-500'>
          Статус активний до {tierExpiry}.
        </p>
      )}

      {!thresholds && !isGold && (
        <p className='text-sm text-neutral-400'>
          Максимальний рівень досягнуто
        </p>
      )}
    </div>
  )
}

export default TierCard
