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
