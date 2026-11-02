import {
  getAchievementPresentation,
  getAchievementProgress,
} from './achievementPresentation'
import type { Achievement } from './achievements.types'

export default function AchievementProgress({
  achievement,
}: {
  achievement: Achievement
}) {
  const progress = getAchievementProgress(achievement)
  if (progress === null) return null
  return (
    <div>
      <p className='text-sm tabular-nums text-[var(--text-muted)]'>
        Прогрес: {achievement.current} / {achievement.target}
      </p>
      <progress
        className='sr-only'
        aria-label={`Прогрес: ${getAchievementPresentation(achievement).title}`}
        aria-valuetext={`${achievement.current} з ${achievement.target}`}
        value={progress}
        max={100}
      />
    </div>
  )
}
