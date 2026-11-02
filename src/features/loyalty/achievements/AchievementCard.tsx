import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AchievementBadge, type AchievementBadgeSize } from './AchievementBadge'
import { getBadgeProgressPercent } from './achievementBadgePresentation'
import { getAchievementPresentation } from './achievementPresentation'
import type { Achievement } from './achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
  featured?: boolean
  featuredLabel?: string
  preview?: boolean
  badgeSize?: AchievementBadgeSize
}

const AchievementCard = ({
  achievement,
  compact,
  featured,
  featuredLabel = 'Найближча ціль',
  preview = false,
  badgeSize = preview || featured ? 'large' : compact ? 'small' : 'medium',
}: AchievementCardProps) => {
  const presentation = getAchievementPresentation(achievement)
  const unlocked = achievement.status === 'unlocked'
  const progress =
    !presentation.hidden && !unlocked && Number.isFinite(achievement.current)
      ? getBadgeProgressPercent(achievement.progressPercent, achievement.target)
      : null
  return (
    <article
      className={cn(
        'min-w-0 border-t border-[var(--border-default)] py-6',
        featured &&
          'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.5fr)] lg:gap-10',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-wrap items-start gap-4',
          preview && 'flex-col',
        )}
      >
        <div className='shrink-0'>
          <AchievementBadge
            icon={achievement.icon}
            rarity={achievement.rarity}
            status={achievement.status}
            progress={progress ?? undefined}
            target={achievement.target}
            hidden={presentation.hidden}
            size={badgeSize}
          />
        </div>
        <div className={cn('min-w-0', !preview && 'flex-1 basis-40')}>
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
        {progress !== null && (
          <div>
            <p className='mb-3 text-sm tabular-nums text-[var(--text-muted)]'>
              Прогрес: {achievement.current} / {achievement.target}
            </p>
            <progress
              className='sr-only'
              aria-label={`Прогрес: ${presentation.title}`}
              aria-valuetext={`${achievement.current} з ${achievement.target}`}
              value={progress}
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
