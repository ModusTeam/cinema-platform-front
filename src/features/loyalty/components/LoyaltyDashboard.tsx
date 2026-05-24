import { LOYALTY_TIER_THRESHOLDS } from '@/constants/loyalty'
import { useLoyalty } from '@/features/account/hooks/useLoyalty'
import type { LoyaltyTier as UiLoyaltyTier } from '@/features/loyalty/api/loyalty.types'
import BalanceWidget from '@/features/loyalty/components/BalanceWidget'
import BenefitsList from '@/features/loyalty/components/BenefitsList'
import BirthdayBonusBanner from '@/features/loyalty/components/BirthdayBonusBanner'
import PointsExpiryNotice from '@/features/loyalty/components/PointsExpiryNotice'
import TierCard from '@/features/loyalty/components/TierCard'
import { useLoyaltyAchievementsPreview } from '@/features/loyalty/hooks/useLoyaltyAchievementsPreview'
import { useLoyaltyBenefits } from '@/features/loyalty/hooks/useLoyaltyBenefits'
import { useLoyaltyProfile } from '@/features/loyalty/hooks/useLoyaltyProfile'
import type { LoyaltyTier as AccountLoyaltyTier } from '@/types/account'
import { AlertCircle, Sparkles } from 'lucide-react'

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

const LOYALTY_TIERS: Record<AccountLoyaltyTier, UiLoyaltyTier> = {
	Bronze: {
		id: 'bronze',
		label: 'Bronze',
		minPoints: 0,
		maxPoints: LOYALTY_TIER_THRESHOLDS.SILVER.points - 1,
		badgeColor: '#b45309',
		benefits: [],
	},
	Silver: {
		id: 'silver',
		label: 'Silver',
		minPoints: LOYALTY_TIER_THRESHOLDS.SILVER.points,
		maxPoints: LOYALTY_TIER_THRESHOLDS.GOLD.points - 1,
		badgeColor: '#94a3b8',
		benefits: [],
	},
	Gold: {
		id: 'gold',
		label: 'Gold',
		minPoints: LOYALTY_TIER_THRESHOLDS.GOLD.points,
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
	const targetPoints =
		tier === 'Bronze'
			? LOYALTY_TIER_THRESHOLDS.SILVER.points
			: LOYALTY_TIER_THRESHOLDS.GOLD.points
	const progress = (points / targetPoints) * 100
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
			<div className='space-y-16'>
				<div className='flex flex-col gap-12 md:flex-row md:gap-8'>
					<div className='h-24 flex-1 rounded bg-white/5 motion-safe:animate-pulse' />
					<div className='hidden h-24 w-px bg-white/5 md:block' />
					<div className='h-24 flex-1 rounded bg-white/5 motion-safe:animate-pulse' />
				</div>
				<div className='h-px w-full bg-white/5' />
				<div className='h-32 rounded bg-white/5 motion-safe:animate-pulse' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='border-l-2 border-red-500/50 py-2 pl-4'>
				<div className='flex items-center gap-2 text-red-400'>
					<AlertCircle size={18} />
					<span className='font-medium'>Лояльність тимчасово недоступна</span>
				</div>
				<p className='mt-2 text-sm text-neutral-400'>{errorMessage}</p>
			</div>
		)
	}

	if (!profileQuery.data) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-center'>
				<Sparkles className='h-8 w-8 text-neutral-600' />
				<h3 className='mt-4 text-lg font-medium text-white'>Немає даних</h3>
				<p className='mt-2 text-sm text-neutral-500'>
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
		<div className='relative space-y-16'>
			<div
				className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] transition-colors duration-1000'
				style={{ backgroundColor: resolvedTier.badgeColor }}
			/>

			<div className='flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8'>
				<div className='flex-1'>
					<BalanceWidget
						pointsBalance={resolvedPointsBalance}
						updatedAt={new Date().toISOString()}
					/>
				</div>
				<div className='hidden h-24 w-px bg-white/5 md:block' />
				<div className='flex-1'>
					<TierCard
						tier={resolvedTier}
						nextTier={resolvedNextTier}
						progressPercent={resolvedProgressPercent}
						currentPoints={resolvedPointsBalance}
					/>
				</div>
			</div>

			<div className='grid gap-6 border-y border-white/5 py-8 md:grid-cols-2'>
				<PointsExpiryNotice expiryDate={profile.pointsExpiryDate} />
				<BirthdayBonusBanner
					isBirthdayMonth={profile.isBirthdayMonth}
					bonusPoints={profile.birthdayBonusPoints}
					isClaimed={profile.birthdayBonusClaimed}
				/>
			</div>

			<section className='space-y-8'>
				<div className='flex flex-col gap-1'>
					<h3 className='text-xl font-medium text-white'>Переваги програми</h3>
					<p className='text-sm text-neutral-500'>
						Усі привілеї за рівнями будуть оновлюватися.
					</p>
				</div>
				<BenefitsList benefits={benefitsQuery.data || []} />
			</section>
		</div>
	)
}

export default LoyaltyDashboard
