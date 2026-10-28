import { Check, Lock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { resolveAchievementIcon } from './achievementContract'
import { getAchievementPresentation } from './achievementPresentation'
import type { Achievement } from './achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
  featured?: boolean
  featuredLabel?: string
}

const AchievementCard = ({
  achievement,
  compact,
  featured,
  featuredLabel = 'Найближча ціль',
}: AchievementCardProps) => {
  const presentation = getAchievementPresentation(achievement)
  const Icon = presentation.hidden
    ? Lock
    : resolveAchievementIcon(
        achievement.icon,
        achievement.category,
        achievement.rarity,
      )
  const unlocked = achievement.status === 'unlocked'
  return (
    <article
      className={cn(
        'min-w-0 border-t border-[var(--border-default)] py-6',
        featured &&
          'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.5fr)] lg:gap-10',
      )}
    >
      <div className='flex min-w-0 items-start gap-4'>
        <div className='mt-1 shrink-0 text-[var(--text-muted)]'>
          <Icon size={24} strokeWidth={1.4} aria-hidden='true' />
        </div>
        <div className='min-w-0'>
          <p className='mb-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]'>
            {unlocked && <Check size={14} aria-hidden='true' />}
            {featured ? `${featuredLabel} · ` : ''}
            {presentation.statusLabel}
          </p>
          <h3 className='type-public-section break-words'>
            {presentation.title}
          </h3>
          <p className='mt-3 text-xs leading-relaxed text-[var(--text-muted)]'>
            {presentation.hidden
              ? 'Секретне'
              : `${achievement.categoryLabel} · ${achievement.rarityLabel}`}
          </p>
          {!compact && (
            <p className='mt-3 max-w-prose text-sm leading-relaxed text-[var(--text-muted)]'>
              {presentation.description}
            </p>
          )}
          {unlocked && achievement.unlockedAt && (
            <p className='mt-3 text-xs text-[var(--text-muted)]'>
              Відкрито{' '}
              <time dateTime={achievement.unlockedAt}>
                {new Date(achievement.unlockedAt).toLocaleDateString('uk-UA')}
              </time>
            </p>
          )}
        </div>
      </div>
      <div
        className={cn('mt-5 space-y-4', featured && 'lg:mt-0 lg:self-center')}
      >
        {!presentation.hidden && !unlocked && achievement.target > 0 && (
          <div>
            <p className='mb-3 text-sm tabular-nums text-[var(--text-muted)]'>
              Прогрес: {achievement.current} / {achievement.target}
            </p>
            <progress
              className='achievement-progress w-full'
              aria-label={`Прогрес: ${presentation.title}`}
              aria-valuetext={`${achievement.current} з ${achievement.target}`}
              value={achievement.progressPercent}
              max={100}
            />
          </div>
        )}
        {!presentation.hidden && achievement.pointsReward > 0 && (
          <p className='text-sm tabular-nums'>
            {unlocked ? 'Нагорода' : 'За відкриття'}: +
            {achievement.pointsReward} балів
          </p>
        )}
      </div>
    </article>
  )
}
export default AchievementCard
