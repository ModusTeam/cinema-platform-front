import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { useAchievementsTabData } from '@/features/loyalty/achievements/hooks/useAchievementsTabData'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const AchievementsTabPanel = () => {
	const { data, isLoading } = useAchievementsTabData()

	if (isLoading || !data) return null

	const recentUnlocked = data.achievements
		.filter(a => a.status === 'unlocked')
		.slice(0, 3)
	const inProgress = data.achievements.find(a => a.status === 'in-progress')

	return (
		<div className='flex flex-col gap-10'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-medium text-white'>Останні досягнення</h2>
				<Link
					to='/profile/achievements'
					className='flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white'
				>
					Повний список <ArrowRight className='h-4 w-4' />
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
				{recentUnlocked.map(achievement => (
					<AchievementCard
						key={achievement.id}
						achievement={achievement}
						compact
					/>
				))}
			</div>

			{inProgress && (
				<div className='flex flex-col gap-4 border-t border-white/5 pt-6'>
					<h3 className='text-sm tracking-widest text-neutral-500 uppercase'>
						У прогресі
					</h3>
					<AchievementCard achievement={inProgress} />
				</div>
			)}
		</div>
	)
}

export default AchievementsTabPanel
