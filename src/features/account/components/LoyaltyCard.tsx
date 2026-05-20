import { clsx } from 'clsx'

import { useLoyalty } from '@/features/account/hooks/useLoyalty'
import type { LoyaltyTier } from '@/types/account'

const TIER_STYLES: Record<
	LoyaltyTier,
	{ label: string; textClass: string; bgClass: string; barClass: string }
> = {
	Bronze: {
		label: 'Bronze',
		textClass: 'text-amber-600',
		bgClass: 'bg-amber-100/10',
		barClass: 'bg-amber-600',
	},
	Silver: {
		label: 'Silver',
		textClass: 'text-slate-300',
		bgClass: 'bg-slate-100/10',
		barClass: 'bg-slate-300',
	},
	Gold: {
		label: 'Gold',
		textClass: 'text-yellow-500',
		bgClass: 'bg-yellow-100/10',
		barClass: 'bg-yellow-500',
	},
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

const getNextTierData = (tier: LoyaltyTier, points: number) => {
	if (tier === 'Gold') return null

	const nextTier = tier === 'Bronze' ? 'Silver' : 'Gold'
	const prevThreshold = tier === 'Bronze' ? 0 : 500
	const nextThreshold = tier === 'Bronze' ? 500 : 1500
	const progress = clamp(
		(points - prevThreshold) / (nextThreshold - prevThreshold),
		0,
		1,
	)
	const remaining = Math.max(0, nextThreshold - points)

	return { nextTier, progress, remaining }
}

const LoyaltyCard = () => {
	const { data, isLoading, error } = useLoyalty()

	if (isLoading) {
		return (
			<div className='rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl'>
				<div className='space-y-4 animate-pulse'>
					<div className='h-5 w-32 rounded-full bg-white/10' />
					<div className='h-8 w-48 rounded-2xl bg-white/10' />
					<div className='h-3 w-full rounded-full bg-white/10' />
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200'>
				{(error as Error).message}
			</div>
		)
	}

	if (!data) return null

	const styles = TIER_STYLES[data.tier]
	const nextTierData = getNextTierData(data.tier, data.points)

	return (
		<div className='rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-xs uppercase tracking-widest text-[var(--text-muted)]'>
						Рівень
					</p>
					<p className={clsx('text-2xl font-black', styles.textClass)}>
						{styles.label}
					</p>
				</div>
				<div
					className={clsx(
						'px-3 py-1 rounded-full text-xs font-bold border border-white/10',
						styles.textClass,
						styles.bgClass,
					)}
				>
					{data.points} балів
				</div>
			</div>

			{nextTierData ? (
				<div className='mt-6 space-y-3'>
					<div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
						<span>Прогрес</span>
						<span>
							{nextTierData.remaining} балів до {nextTierData.nextTier}
						</span>
					</div>
					<div className='h-2 w-full rounded-full bg-white/10 overflow-hidden'>
						<div
							className={clsx('h-full rounded-full', styles.barClass)}
							style={{ width: `${nextTierData.progress * 100}%` }}
						/>
					</div>
				</div>
			) : (
				<div className='mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-muted)]'>
					Максимальний рівень досягнуто
				</div>
			)}
		</div>
	)
}

export default LoyaltyCard
