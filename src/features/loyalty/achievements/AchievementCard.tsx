import { clsx } from 'clsx'
import { Gift, Lock, Trophy } from 'lucide-react'

import { resolveAchievementIcon } from './achievementContract'
import type { Achievement } from './achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
}

const AchievementCard = ({ achievement, compact }: AchievementCardProps) => {
  const isLocked = achievement.status === 'locked'
  const Icon = resolveAchievementIcon(
    achievement.icon,
    achievement.category,
    achievement.rarity,
  )

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-opacity',
        isLocked ? 'opacity-50 grayscale' : 'opacity-100',
      )}
    >
      <div className='flex items-start gap-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg'>
          <Icon className='h-5 w-5 text-[var(--color-primary)]' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-col gap-1'>
              <h4 className='font-medium text-white'>{achievement.title}</h4>
              <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500'>
                <span>{achievement.categoryLabel}</span>
                <span>·</span>
                <span>{achievement.rarityLabel}</span>
              </div>
            </div>
            {isLocked ? (
              <Lock className='h-4 w-4 shrink-0 text-neutral-600' />
            ) : (
              <Trophy className='h-4 w-4 shrink-0 text-[var(--color-primary)]' />
            )}
          </div>

          {!compact && (
            <p className='mt-2 text-sm text-neutral-400'>
              {isLocked && achievement.isSecret && achievement.secretHint
                ? achievement.secretHint
                : achievement.description}
            </p>
          )}
        </div>
      </div>

      {achievement.target > 0 && achievement.status !== 'unlocked' && (
        <div className='mt-2 flex flex-col gap-2'>
          <div className='flex items-center justify-between text-xs text-neutral-500'>
            <span>Прогрес</span>
            <span>
              {achievement.current} / {achievement.target}
            </span>
          </div>
          <div className='h-1 w-full overflow-hidden rounded-full bg-white/5'>
            <div
              className='h-full bg-white transition-all duration-500'
              style={{ width: `${achievement.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {achievement.pointsReward > 0 && (
        <div className='flex items-center gap-2 text-xs text-amber-300'>
          <Gift className='h-3.5 w-3.5' />
          <span>+{achievement.pointsReward} балів</span>
        </div>
      )}
    </div>
  )
}

export default AchievementCard
