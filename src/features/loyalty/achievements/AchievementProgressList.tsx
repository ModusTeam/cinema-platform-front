import type { Achievement } from './achievements.types'

interface AchievementProgressListProps {
  achievements: Achievement[]
}

const AchievementProgressList = ({
  achievements,
}: AchievementProgressListProps) => {
  if (achievements.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-[var(--text-muted)]'>
        Наразі немає активних досягнень у прогресі.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {achievements.map(item => {
        const progressPercent = item.total
          ? Math.min(100, Math.round(((item.progress || 0) / item.total) * 100))
          : 0

        return (
          <div
            key={item.id}
            className='rounded-2xl border border-white/10 bg-[var(--bg-card)] p-5'
          >
            <div className='flex items-center justify-between text-sm font-semibold text-white'>
              <span>{item.title}</span>
              <span className='text-xs text-[var(--text-muted)]'>
                {item.progress || 0}/{item.total}
              </span>
            </div>
            <p className='mt-2 text-xs text-[var(--text-muted)]'>
              {item.description}
            </p>
            <div className='mt-3 h-2 rounded-full bg-white/10'>
              <div
                className='h-2 rounded-full bg-[var(--color-primary)]'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AchievementProgressList
