import { Crown } from 'lucide-react'

import type { LoyaltyTier } from '@/features/loyalty/api/loyalty.types'
import TierProgress from '@/features/loyalty/components/TierProgress'

interface TierCardProps {
  tier: LoyaltyTier
  nextTier?: LoyaltyTier
  progressPercent: number
  currentPoints: number
}

const TierCard = ({
  tier,
  nextTier,
  progressPercent,
  currentPoints,
}: TierCardProps) => {
  return (
    <div className='rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6 shadow-xl'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='text-xs uppercase tracking-wider text-[var(--text-muted)]'>
            Поточний рівень
          </div>
          <div className='mt-2 flex items-center gap-2 text-2xl font-black text-white'>
            <span>{tier.label}</span>
            <span
              className='inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider'
              style={{ borderColor: `${tier.badgeColor}66`, color: tier.badgeColor }}
            >
              Tier
            </span>
          </div>
        </div>
        <div
          className='rounded-2xl border border-white/10 bg-white/5 p-3'
          style={{ color: tier.badgeColor }}
        >
          <Crown size={22} />
        </div>
      </div>

      <TierProgress
        progressPercent={progressPercent}
        currentPoints={currentPoints}
        nextTierPoints={nextTier?.minPoints}
        nextTierLabel={nextTier?.label}
      />

      <p className='mt-4 text-xs text-[var(--text-muted)]'>
        Підвищуйте статус, щоб отримувати більше бонусів та привілеїв.
      </p>
    </div>
  )
}

export default TierCard
