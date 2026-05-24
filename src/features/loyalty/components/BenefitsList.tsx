import type { LoyaltyBenefit } from '@/features/loyalty/api/loyalty.types'

interface BenefitsListProps {
	benefits: LoyaltyBenefit[]
}

const BenefitsList = ({ benefits }: BenefitsListProps) => {
	return (
		<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
			{benefits.map(benefit => (
				<div key={benefit.id} className='flex flex-col gap-3'>
					<h3 className='text-lg font-medium text-white'>{benefit.title}</h3>
					<p className='text-sm leading-relaxed text-neutral-400'>
						{benefit.description}
					</p>
					<span className='w-fit rounded bg-white/5 px-2 py-1 text-[10px] tracking-widest text-neutral-500 uppercase'>
						Рівень: {benefit.tier}
					</span>
				</div>
			))}
		</div>
	)
}

export default BenefitsList
