import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AchievementsPreviewProps {
	data: AchievementsPreviewData
}

const AchievementsPreview = ({ data }: AchievementsPreviewProps) => {
	return (
		<Link
			to='/profile/achievements'
			className='group flex w-fit items-center gap-3 rounded-full bg-white/5 px-4 py-2 transition-colors hover:bg-white/10'
		>
			<span className='text-sm text-neutral-300'>
				Відкрито досягнень:{' '}
				<strong className='text-white'>{data.totalUnlocked}</strong> /{' '}
				{data.totalAvailable}
			</span>
			<ArrowRight className='h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:text-white' />
		</Link>
	)
}

export default AchievementsPreview
