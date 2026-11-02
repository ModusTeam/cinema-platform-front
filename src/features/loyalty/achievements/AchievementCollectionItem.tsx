import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { AchievementBadge } from './AchievementBadge'
import AchievementProgress from './AchievementProgress'
import { achievementDetailsPath } from './achievementCollectionModel'
import {
  getAchievementPresentation,
  getAchievementProgress,
} from './achievementPresentation'
import type { Achievement } from './achievements.types'

export default function AchievementCollectionItem({
  achievement,
  featured = false,
  search = '',
}: {
  achievement: Achievement
  featured?: boolean
  search?: string
}) {
  const presentation = getAchievementPresentation(achievement)
  return (
    <Link
      to={achievementDetailsPath(achievement.id, search)}
      aria-label={`${presentation.title} — ${presentation.statusLabel}`}
      className={cn(
        'achievement-collection-item',
        featured && 'achievement-collection-item--featured',
      )}
    >
      <div className='achievement-collection-item__badge'>
        <AchievementBadge
          icon={achievement.icon}
          rarity={achievement.rarity}
          status={achievement.status}
          hidden={presentation.hidden}
          progress={getAchievementProgress(achievement) ?? undefined}
          target={achievement.target}
          size={featured ? 'display' : 'large'}
        />
      </div>
      <div className='min-w-0'>
        {featured && (
          <h2 className='mb-4 text-sm text-[var(--account-muted)]'>
            Найближча ціль
          </h2>
        )}
        <h3
          className={cn(
            'achievement-collection-item__title',
            featured && 'account-ticket-title',
          )}
        >
          {presentation.title}
        </h3>
        <p className='mt-3 text-sm text-[var(--account-muted)]'>
          {presentation.statusLabel}
          {!presentation.hidden && <> · {achievement.rarityLabel}</>}
        </p>
        {(featured || presentation.hidden) && (
          <p className='mt-3 max-w-lg text-sm leading-relaxed text-[var(--account-muted)]'>
            {presentation.description}
          </p>
        )}
        <div className='mt-3'>
          <AchievementProgress achievement={achievement} />
        </div>
        {achievement.status === 'unlocked' && achievement.unlockedAt && (
          <p className='mt-3 text-xs text-[var(--account-muted)]'>
            Відкрито{' '}
            <time dateTime={achievement.unlockedAt}>
              {new Date(achievement.unlockedAt).toLocaleDateString('uk-UA')}
            </time>
          </p>
        )}
        <span className='mt-5 inline-flex items-center gap-1 text-xs underline underline-offset-4'>
          Переглянути <ArrowUpRight size={14} aria-hidden='true' />
        </span>
      </div>
    </Link>
  )
}
