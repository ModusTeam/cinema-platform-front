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
		<div className='flex w-full flex-col gap-4 md:w-1/2'>
			<div className='flex flex-col gap-1'>
				<span className='text-sm tracking-widest text-neutral-500 uppercase'>
					Поточний рівень
				</span>
				<div className='flex items-baseline gap-3'>
					<h2 className='text-3xl font-semibold text-white'>{tier.label}</h2>
					<span className='rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] tracking-widest text-neutral-400 uppercase'>
						Tier
					</span>
				</div>
			</div>

			{!nextTier ? (
				<p className='text-sm text-neutral-400'>
					Максимальний рівень досягнуто
				</p>
			) : (
				<TierProgress
					progressPercent={progressPercent}
					currentPoints={currentPoints}
					nextTierPoints={nextTier.minPoints}
					nextTierLabel={nextTier.label}
				/>
			)}
		</div>
	)
}

export default TierCard
