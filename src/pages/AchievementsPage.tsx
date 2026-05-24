import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { useAchievementsTabData } from '@/features/loyalty/achievements/hooks/useAchievementsTabData'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const AchievementsPage = () => {
	const { data, isLoading } = useAchievementsTabData()

	if (isLoading || !data) return null

	return (
		<div className='mx-auto max-w-5xl px-4 py-12 md:px-8'>
			<Link
				to='/profile'
				className='mb-8 flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white'
			>
				<ArrowLeft className='h-4 w-4' />
				Назад до профілю
			</Link>

			<header className='mb-12 flex flex-col gap-2'>
				<h1 className='text-3xl font-medium text-white'>Досягнення</h1>
				<p className='text-neutral-500'>
					Відкрито {data.summary.unlocked} з {data.summary.total}
				</p>
			</header>

			<div className='grid grid-cols-1 gap-x-8 gap-y-4 border-t border-white/5 pt-8 md:grid-cols-2 lg:grid-cols-3'>
				{data.achievements.map(achievement => (
					<AchievementCard key={achievement.id} achievement={achievement} />
				))}
			</div>
		</div>
	)
}

export default AchievementsPage
