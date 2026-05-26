import { clsx } from 'clsx'
import { Gift, Lock, Trophy } from 'lucide-react'

import { resolveAchievementIcon } from './achievementContract'
import type { Achievement } from './achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
  featured?: boolean
  featuredLabel?: string
}

const RARITY_TONE: Record<Achievement['rarity'], string> = {
  common: 'border-white/10 bg-white/5 text-neutral-300',
  uncommon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  rare: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  epic: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
  legendary: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
  unspecified: 'border-white/10 bg-white/5 text-neutral-300',
}

const CATEGORY_TONE: Record<Achievement['category'], string> = {
  visits: 'bg-cyan-400/10 text-cyan-200',
  spending: 'bg-amber-400/10 text-amber-200',
  tier: 'bg-violet-400/10 text-violet-200',
  time: 'bg-blue-400/10 text-blue-200',
  special: 'bg-pink-400/10 text-pink-200',
  streak: 'bg-orange-400/10 text-orange-200',
  secret: 'bg-neutral-400/10 text-neutral-200',
  unspecified: 'bg-white/5 text-neutral-300',
}

const AchievementCard = ({
  achievement,
  compact,
  featured,
  featuredLabel = 'Найближча ціль',
}: AchievementCardProps) => {
  const isLocked = achievement.status === 'locked'
  const Icon = resolveAchievementIcon(
    achievement.icon,
    achievement.category,
    achievement.rarity,
  )

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 rounded-xl border bg-white/[0.02] p-4 transition-opacity',
        featured
          ? 'border-[var(--color-primary)]/40 bg-white/[0.04] shadow-[0_0_40px_rgba(255,255,255,0.04)]'
          : 'border-white/5',
        isLocked ? 'opacity-50 grayscale' : 'opacity-100',
      )}
    >
      {featured && (
        <span className='w-fit rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[var(--color-primary)]'>
          {featuredLabel}
        </span>
      )}

      <div className='flex items-start gap-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg'>
          <Icon className='h-5 w-5 text-[var(--color-primary)]' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-col gap-1'>
              <h4 className='font-medium text-white'>{achievement.title}</h4>
              <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest'>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5',
                    CATEGORY_TONE[achievement.category],
                  )}
                >
                  {achievement.categoryLabel}
                </span>
                <span
                  className={clsx(
                    'rounded-full border px-2 py-0.5',
                    RARITY_TONE[achievement.rarity],
                  )}
                >
                  {achievement.rarityLabel}
                </span>
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
