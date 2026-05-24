import { clsx } from 'clsx'
import type { Achievement } from './achievements.types'

interface AchievementCardProps {
	achievement: Achievement
	compact?: boolean
}

const AchievementCard = ({ achievement, compact }: AchievementCardProps) => {
	const isLocked = achievement.status === 'locked'

	return (
		<div
			className={clsx(
				'flex flex-col gap-3 py-4 transition-opacity',
				isLocked ? 'opacity-50 grayscale' : 'opacity-100',
			)}
		>
			<div className='flex items-start justify-between gap-4'>
				<div className='flex flex-col gap-1'>
					<h4 className='font-medium text-white'>{achievement.title}</h4>
					{!compact && (
						<p className='text-sm text-neutral-400'>
							{achievement.description}
						</p>
					)}
				</div>
				<span className='shrink-0 rounded bg-white/5 px-2 py-1 text-[10px] tracking-widest text-neutral-500 uppercase'>
					{achievement.rarity}
				</span>
			</div>

			{achievement.status === 'in-progress' && achievement.total && (
				<div className='mt-2 flex flex-col gap-2'>
					<div className='flex items-center justify-between text-xs text-neutral-500'>
						<span>Прогрес</span>
						<span>
							{achievement.progress} / {achievement.total}
						</span>
					</div>
					<div className='h-1 w-full overflow-hidden rounded-full bg-white/5'>
						<div
							className='h-full bg-white transition-all duration-500'
							style={{
								width: `${(achievement.progress! / achievement.total) * 100}%`,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default AchievementCard
