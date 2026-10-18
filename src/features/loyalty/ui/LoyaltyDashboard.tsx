import { useLoyaltyAchievementsPreview } from '@/features/loyalty/model/useLoyaltyAchievementsPreview'
import { useLoyaltyProfile } from '@/features/loyalty/model/useLoyaltyProfile'
import {
	ArrowRight,
	BarChart3,
	Gift,
	Sparkles,
	Trophy,
	Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'

const LoyaltyDashboard = () => {
	const profileQuery = useLoyaltyProfile()
	const achievementsQuery = useLoyaltyAchievementsPreview()

	if (profileQuery.isLoading) {
		return (
			<div className='space-y-4'>
				<div className='grid gap-4 md:grid-cols-3'>
					<div className='h-40 rounded-lg bg-white/5 motion-safe:animate-pulse' />
					<div className='h-40 rounded-lg bg-white/5 motion-safe:animate-pulse' />
					<div className='h-40 rounded-lg bg-white/5 motion-safe:animate-pulse' />
				</div>
				<div className='grid gap-4 lg:grid-cols-[1.35fr_1fr]'>
					<div className='h-56 rounded-lg bg-white/5 motion-safe:animate-pulse' />
					<div className='h-56 rounded-lg bg-white/5 motion-safe:animate-pulse' />
				</div>
			</div>
		)
	}

	if (profileQuery.error) {
		return <UnavailableState title='Лояльність тимчасово недоступна' onRetry={() => void profileQuery.refetch()} />
	}

	if (!profileQuery.data) {
		return (
			<EmptyState
				icon={<Sparkles className='h-12 w-12' />}
				title='Немає даних'
				description='Профіль лояльності зʼявиться після першого бронювання.'
			/>
		)
	}

	const profile = profileQuery.data
	const nearestAchievement = achievementsQuery.data?.items.find(
		achievement => achievement.status === 'in-progress',
	)
	const achievementProgress = nearestAchievement
		? Math.min(
				100,
				Math.max(
					0,
					nearestAchievement.progressPercent ||
						(nearestAchievement.target > 0
							? (nearestAchievement.current / nearestAchievement.target) * 100
							: 0),
				),
			)
		: 0

	return (
		<div className='relative space-y-5'>
			<div
				className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] transition-colors duration-1000'
				style={{ backgroundColor: profile.tier.badgeColor }}
			/>

			<div className='grid gap-4 md:grid-cols-3'>
				<section className='rounded-lg border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]'>
					<div className='flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase'>
						<Wallet className='h-4 w-4 text-[var(--color-primary)]' />
						Поточний баланс
					</div>
					<div className='mt-6 flex items-end gap-2'>
						<strong className='text-4xl font-semibold leading-none text-white md:text-5xl'>
							{profile.pointsBalance}
						</strong>
						<span className='pb-1 text-base text-neutral-400'>балів</span>
					</div>
				</section>

				<section className='rounded-lg border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]'>
					<div className='flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase'>
						<Sparkles className='h-4 w-4 text-[var(--color-primary)]' />
						Поточний статус
					</div>
					<div className='mt-6 flex items-center gap-3'>
						<span
							className='h-2.5 w-2.5 rounded-full'
							style={{
								backgroundColor: profile.tier.badgeColor,
								boxShadow: `0 0 14px ${profile.tier.badgeColor}`,
							}}
						/>
						<strong className='text-4xl font-semibold leading-none text-white md:text-5xl'>
							{profile.tier.label}
						</strong>
					</div>
					<p className='mt-4 text-sm leading-relaxed text-neutral-400'>
						Максимальний рівень програми лояльності
					</p>
				</section>

				<section className='rounded-lg border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]'>
					<div className='flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase'>
						<BarChart3 className='h-4 w-4 text-[var(--color-primary)]' />
						Річна активність
					</div>
					<dl className='mt-6 space-y-3 text-sm'>
						<div className='flex items-center justify-between gap-4 rounded-md bg-white/[0.03] px-3 py-2'>
							<dt className='text-neutral-500'>Балів цього року</dt>
							<dd className='font-medium text-white'>{profile.yearPoints}</dd>
						</div>
						<div className='flex items-center justify-between gap-4 rounded-md bg-white/[0.03] px-3 py-2'>
							<dt className='text-neutral-500'>Візитів цього року</dt>
							<dd className='font-medium text-white'>{profile.yearVisits}</dd>
						</div>
					</dl>
				</section>
			</div>

			<div>
				<section className='flex min-h-64 flex-col rounded-lg border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]'>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase'>
							<Trophy className='h-4 w-4 text-[var(--color-primary)]' />
							Досягнення
						</div>
						{achievementsQuery.isLoading ? (
							<div className='h-5 w-24 rounded-full bg-white/5 motion-safe:animate-pulse' />
						) : achievementsQuery.data ? (
							<span className='text-sm text-neutral-400'>
								Відкрито:{' '}
								<strong className='text-white'>
									{achievementsQuery.data.totalUnlocked}
								</strong>{' '}
								/ {achievementsQuery.data.totalAvailable}
							</span>
						) : null}
					</div>

					{achievementsQuery.isLoading ? (
						<div className='mt-8 space-y-4'>
							<div className='h-5 w-3/4 rounded bg-white/5 motion-safe:animate-pulse' />
							<div className='h-2 rounded-full bg-white/5 motion-safe:animate-pulse' />
						</div>
					) : achievementsQuery.error ? (
						<UnavailableState title='Досягнення тимчасово недоступні' onRetry={() => void achievementsQuery.refetch()} className='mt-8 border-0 bg-transparent px-0 py-4' />
					) : nearestAchievement ? (
						<div className='mt-8'>
							<p className='text-base font-medium leading-relaxed text-white'>
								Найближче досягнення: {nearestAchievement.title}
							</p>
							<div className='mt-5 h-2.5 overflow-hidden rounded-full bg-white/10'>
								<div
									className='h-full rounded-full bg-[var(--color-primary)] transition-all duration-700'
									style={{ width: `${achievementProgress}%` }}
								/>
							</div>
							<div className='mt-2 text-right text-xs font-medium text-neutral-400'>
								Прогрес: {nearestAchievement.current}/
								{nearestAchievement.target}
							</div>
						</div>
					) : (
						<p className='mt-8 text-sm text-neutral-500'>
							Усі доступні досягнення вже відкрито або вони зʼявляться згодом.
						</p>
					)}

					<Link
						to='/profile/achievements'
						className='mt-auto flex w-fit items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition-opacity hover:opacity-90'
					>
						Переглянути всі досягнення
						<ArrowRight className='h-4 w-4' />
					</Link>
				</section>
			</div>

			<div className='flex justify-end border-t border-white/5 pt-5'>
				<Link
					to='/account/loyalty/history'
					className='flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-white/20 hover:text-white'
				>
					<Gift className='h-4 w-4' />
					Історія балів
				</Link>
			</div>
		</div>
	)
}

export default LoyaltyDashboard
