import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import type { AchievementsPreviewData } from '@/features/loyalty/achievements/achievements.types'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'

interface AchievementsPreviewProps {
  data: AchievementsPreviewData
}

const AchievementsPreview = ({ data }: AchievementsPreviewProps) => {
  return (
    <div className='rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-lg font-bold text-white'>Досягнення</h3>
          <p className='text-xs text-[var(--text-muted)]'>
            Відкрито {data.totalUnlocked} з {data.totalAvailable}
          </p>
        </div>
        <Link
          to='/profile'
          className='flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]'
        >
          Перейти у профіль <ChevronRight size={14} />
        </Link>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        {data.items.map(item => (
          <AchievementCard key={item.id} achievement={item} compact />
        ))}
      </div>
      <p className='mt-4 text-xs text-[var(--text-muted)]'>
        Деякі досягнення активуються після підключення бекенду.
      </p>
    </div>
  )
}

export default AchievementsPreview
