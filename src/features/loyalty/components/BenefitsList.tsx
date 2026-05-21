import type { LoyaltyBenefit } from '@/features/loyalty/api/loyalty.types'

interface BenefitsListProps {
  benefits: LoyaltyBenefit[]
}

const BenefitsList = ({ benefits }: BenefitsListProps) => {
  if (benefits.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-[var(--text-muted)]'>
        Переваги будуть додані після запуску програми лояльності.
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {benefits.map(benefit => (
        <div
          key={benefit.id}
          className='rounded-2xl border border-white/10 bg-[var(--bg-card)] p-5'
        >
          <h4 className='text-sm font-bold text-white'>{benefit.title}</h4>
          <p className='mt-2 text-xs text-[var(--text-muted)]'>
            {benefit.description}
          </p>
          <span className='mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]'>
            Рівень: {benefit.tier}
          </span>
        </div>
      ))}
    </div>
  )
}

export default BenefitsList
