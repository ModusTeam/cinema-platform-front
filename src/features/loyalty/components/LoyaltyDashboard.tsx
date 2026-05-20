import { AlertCircle, Sparkles } from 'lucide-react'

import { useLoyalty } from '@/features/account/hooks/useLoyalty'
import type { LoyaltyTier as UiLoyaltyTier } from '@/features/loyalty/api/loyalty.types'
import AchievementsPreview from '@/features/loyalty/components/AchievementsPreview'
import BalanceWidget from '@/features/loyalty/components/BalanceWidget'
import BenefitSimulator from '@/features/loyalty/components/BenefitSimulator'
import BenefitsList from '@/features/loyalty/components/BenefitsList'
import BirthdayBonusBanner from '@/features/loyalty/components/BirthdayBonusBanner'
import PointsExpiryNotice from '@/features/loyalty/components/PointsExpiryNotice'
import TierCard from '@/features/loyalty/components/TierCard'
import { useLoyaltyAchievementsPreview } from '@/features/loyalty/hooks/useLoyaltyAchievementsPreview'
import { useLoyaltyBenefits } from '@/features/loyalty/hooks/useLoyaltyBenefits'
import { useLoyaltyProfile } from '@/features/loyalty/hooks/useLoyaltyProfile'
import type { LoyaltyTier as AccountLoyaltyTier } from '@/types/account'

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

const LOYALTY_TIERS: Record<AccountLoyaltyTier, UiLoyaltyTier> = {
	Bronze: {
		id: 'bronze',
		label: 'Bronze',
		minPoints: 0,
		maxPoints: 499,
		badgeColor: '#b45309',
		benefits: [],
	},
	Silver: {
		id: 'silver',
		label: 'Silver',
		minPoints: 500,
		maxPoints: 1499,
		badgeColor: '#94a3b8',
		benefits: [],
	},
	Gold: {
		id: 'gold',
		label: 'Gold',
		minPoints: 1500,
		badgeColor: '#f59e0b',
		benefits: [],
	},
}

const getNextTier = (tier: AccountLoyaltyTier) => {
	if (tier === 'Bronze') return LOYALTY_TIERS.Silver
	if (tier === 'Silver') return LOYALTY_TIERS.Gold
	return undefined
}

const getProgressPercent = (tier: AccountLoyaltyTier, points: number) => {
	if (tier === 'Gold') return 100
	const [start, end] = tier === 'Bronze' ? [0, 500] : [500, 1500]
	const progress = ((points - start) / (end - start)) * 100
	return clamp(progress, 0, 100)
}

const LoyaltyDashboard = () => {
	const loyaltyQuery = useLoyalty()
	const profileQuery = useLoyaltyProfile()
	const benefitsQuery = useLoyaltyBenefits()
	const achievementsQuery = useLoyaltyAchievementsPreview()

	const isLoading =
		loyaltyQuery.isLoading ||
		profileQuery.isLoading ||
		benefitsQuery.isLoading ||
		achievementsQuery.isLoading

	const error =
		loyaltyQuery.error ||
		profileQuery.error ||
		benefitsQuery.error ||
		achievementsQuery.error
	const errorMessage =
		error instanceof Error ? error.message : 'Помилка завантаження'

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='h-40 rounded-3xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
					<div className='h-40 rounded-3xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
				</div>
				<div className='h-32 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none' />
				<div className='grid gap-4 md:grid-cols-2'>
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className='h-28 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none'
						/>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
				<div className='flex items-center gap-2 text-red-200'>
					<AlertCircle size={18} />
					<span className='font-semibold'>Лояльність тимчасово недоступна</span>
				</div>
				<p className='mt-2 text-sm text-red-100/80'>{errorMessage}</p>
			</div>
		)
	}

	if (!profileQuery.data) {
		return (
			<div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center'>
				<Sparkles className='mx-auto h-10 w-10 text-[var(--text-muted)]' />
				<h3 className='mt-4 text-lg font-bold text-white'>Немає даних</h3>
				<p className='mt-2 text-sm text-[var(--text-muted)]'>
					Профіль лояльності зʼявиться після першого бронювання.
				</p>
			</div>
		)
	}

	const profile = profileQuery.data
	const loyaltyPoints = loyaltyQuery.data?.points
	const loyaltyTier = loyaltyQuery.data?.tier
	const resolvedTier = loyaltyTier ? LOYALTY_TIERS[loyaltyTier] : profile.tier
	const resolvedNextTier = loyaltyTier
		? getNextTier(loyaltyTier)
		: profile.nextTier
	const resolvedProgressPercent =
		loyaltyTier && loyaltyPoints !== undefined
			? getProgressPercent(loyaltyTier, loyaltyPoints)
			: profile.progressPercent
	const resolvedPointsBalance =
		loyaltyPoints !== undefined ? loyaltyPoints : profile.pointsBalance

	return (
		<div className='space-y-8'>
			<div className='grid gap-6 lg:grid-cols-2'>
				<BalanceWidget
					pointsBalance={resolvedPointsBalance}
					updatedAt={new Date().toISOString()}
				/>
				<TierCard
					tier={resolvedTier}
					nextTier={resolvedNextTier}
					progressPercent={resolvedProgressPercent}
					currentPoints={resolvedPointsBalance}
				/>
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<PointsExpiryNotice expiryDate={profile.pointsExpiryDate} />
				<BirthdayBonusBanner
					isBirthdayMonth={profile.isBirthdayMonth}
					bonusPoints={profile.birthdayBonusPoints}
					isClaimed={profile.birthdayBonusClaimed}
				/>
			</div>

			<section className='space-y-4'>
				<div>
					<h3 className='text-lg font-bold text-white'>Переваги програми</h3>
					<p className='text-sm text-[var(--text-muted)]'>
						Усі привілеї за рівнями будуть оновлюватися.
					</p>
				</div>
				<BenefitsList benefits={benefitsQuery.data || []} />
			</section>

			{achievementsQuery.data ? (
				<AchievementsPreview data={achievementsQuery.data} />
			) : (
				<div className='rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-[var(--text-muted)]'>
					Превʼю досягнень зʼявиться після першого бронювання.
				</div>
			)}

			<BenefitSimulator />
		</div>
	)
}

export default LoyaltyDashboard
