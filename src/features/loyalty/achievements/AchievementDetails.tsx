import { AchievementBadge } from './AchievementBadge'
import AchievementProgress from './AchievementProgress'
import {
  getAchievementPresentation,
  getAchievementProgress,
} from './achievementPresentation'
import type { Achievement } from './achievements.types'

export default function AchievementDetails({
  achievement,
}: {
  achievement: Achievement
}) {
  const presentation = getAchievementPresentation(achievement)
  return (
    <article className='mx-auto max-w-3xl pb-6 pt-5 text-center sm:pt-8'>
      <AchievementBadge
        icon={achievement.icon}
        rarity={achievement.rarity}
        status={achievement.status}
        hidden={presentation.hidden}
        size='display'
        progress={getAchievementProgress(achievement) ?? undefined}
        target={achievement.target}
      />
      <h1 className='account-heading mt-6'>{presentation.title}</h1>
      <p className='mt-5 text-sm text-[var(--account-muted)]'>
        {presentation.statusLabel}
        {!presentation.hidden && (
          <>
            {' '}
            · {achievement.rarityLabel} · {achievement.categoryLabel}
          </>
        )}
      </p>
      <p className='mx-auto mt-6 max-w-lg text-base leading-relaxed'>
        {presentation.description}
      </p>
      <div className='mx-auto mt-8 max-w-lg space-y-5 border-t border-[var(--account-rule)] pt-6'>
        <AchievementProgress achievement={achievement} />
        {!presentation.hidden && achievement.pointsReward > 0 && (
          <p className='text-sm tabular-nums'>
            {achievement.status === 'unlocked' ? 'Нагорода' : 'За відкриття'}: +
            {achievement.pointsReward} балів
          </p>
        )}
        {achievement.status === 'unlocked' && achievement.unlockedAt && (
          <p className='text-sm text-[var(--account-muted)]'>
            Відкрито{' '}
            <time dateTime={achievement.unlockedAt}>
              {new Date(achievement.unlockedAt).toLocaleDateString('uk-UA')}
            </time>
          </p>
        )}
      </div>
    </article>
  )
}
