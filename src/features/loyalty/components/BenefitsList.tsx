import type { LoyaltyBenefit } from '@/features/loyalty/api/loyalty.types'

interface BenefitsListProps {
	benefits: LoyaltyBenefit[]
}

const getTierColor = (tierId: string) => {
	switch (tierId.toLowerCase()) {
		case 'bronze':
			return 'bg-[#b45309] shadow-[#b45309]'
		case 'silver':
			return 'bg-[#94a3b8] shadow-[#94a3b8]'
		case 'gold':
			return 'bg-[#f59e0b] shadow-[#f59e0b]'
		default:
			return 'bg-white/20'
	}
}

const BenefitsList = ({ benefits }: BenefitsListProps) => {
	return (
		<div className='grid grid-cols-1 gap-12 md:grid-cols-3'>
			{benefits.map(benefit => (
				<div key={benefit.id} className='group flex flex-col gap-3'>
					<h3 className='text-base font-medium text-white transition-colors group-hover:text-neutral-200'>
						{benefit.title}
					</h3>
					<p className='text-sm leading-relaxed text-neutral-500'>
						{benefit.description}
					</p>
					<div className='mt-1 flex items-center gap-2'>
						<span
							className={`h-1.5 w-1.5 rounded-full ${getTierColor(benefit.tier)}`}
							style={{ boxShadow: '0 0 8px currentColor' }}
						/>
						<span className='text-[10px] tracking-widest text-neutral-500 uppercase'>
							{benefit.tier}
						</span>
					</div>
				</div>
			))}
		</div>
	)
}

export default BenefitsList
