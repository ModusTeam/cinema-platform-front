import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'

import type {
  BenefitSimulationInput,
  BenefitSimulationResult,
  LoyaltyTierKey,
} from '@/features/loyalty/api/loyalty.types'

const getTierByPoints = (points: number): LoyaltyTierKey => {
  if (points >= 4000) return 'gold'
  if (points >= 1500) return 'silver'
  return 'bronze'
}

const getSavingsRate = (tier: LoyaltyTierKey) => {
  if (tier === 'gold') return 0.12
  if (tier === 'silver') return 0.07
  return 0.03
}

const BenefitSimulator = () => {
  const [input, setInput] = useState<BenefitSimulationInput>({
    ticketsPerYear: 10,
    avgTicketPrice: 180,
    concessionsPerVisit: 80,
  })

  const result = useMemo<BenefitSimulationResult>(() => {
    const annualSpend =
      input.ticketsPerYear * input.avgTicketPrice +
      input.ticketsPerYear * input.concessionsPerVisit
    const estimatedPoints = Math.round(annualSpend * 0.1)
    const estimatedTier = getTierByPoints(estimatedPoints)
    const estimatedSavings = Math.round(annualSpend * getSavingsRate(estimatedTier))

    return {
      estimatedPoints,
      estimatedTier,
      estimatedSavings,
    }
  }, [input])

  return (
    <div className='rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6 shadow-xl'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--color-primary)]'>
          <Calculator size={18} />
        </div>
        <div>
          <h3 className='text-lg font-bold text-white'>Симулятор вигоди</h3>
          <p className='text-xs text-[var(--text-muted)]'>
            Орієнтовні розрахунки без підключення бекенду.
          </p>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <label className='space-y-2 text-xs text-[var(--text-muted)]'>
          Квитків на рік
          <input
            type='number'
            min={1}
            value={input.ticketsPerYear}
            onChange={event =>
              setInput(prev => ({
                ...prev,
                ticketsPerYear: Number(event.target.value),
              }))
            }
            className='w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white'
          />
        </label>
        <label className='space-y-2 text-xs text-[var(--text-muted)]'>
          Середній чек квитка, ₴
          <input
            type='number'
            min={50}
            value={input.avgTicketPrice}
            onChange={event =>
              setInput(prev => ({
                ...prev,
                avgTicketPrice: Number(event.target.value),
              }))
            }
            className='w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white'
          />
        </label>
        <label className='space-y-2 text-xs text-[var(--text-muted)]'>
          Кінобар за відвідування, ₴
          <input
            type='number'
            min={0}
            value={input.concessionsPerVisit}
            onChange={event =>
              setInput(prev => ({
                ...prev,
                concessionsPerVisit: Number(event.target.value),
              }))
            }
            className='w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white'
          />
        </label>
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='text-xs text-[var(--text-muted)]'>Балів на рік</div>
          <div className='mt-2 text-xl font-bold text-white'>
            {result.estimatedPoints}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='text-xs text-[var(--text-muted)]'>Очікуваний рівень</div>
          <div className='mt-2 text-xl font-bold text-white'>
            {result.estimatedTier.toUpperCase()}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='text-xs text-[var(--text-muted)]'>Орієнтовна економія</div>
          <div className='mt-2 text-xl font-bold text-white'>
            {result.estimatedSavings} ₴
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenefitSimulator
