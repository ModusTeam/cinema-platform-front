import { Medal, Lock, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

import type { Achievement } from './achievements.types'

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
}

const getStatusLabel = (status: Achievement['status']) => {
  if (status === 'unlocked') return 'Відкрито'
  if (status === 'in-progress') return 'В процесі'
  return 'Заблоковано'
}

const getRarityLabel = (rarity: Achievement['rarity']) => {
  if (rarity === 'legendary') return 'Легендарне'
  if (rarity === 'epic') return 'Епічне'
  if (rarity === 'rare') return 'Рідкісне'
  return 'Звичайне'
}

const getRarityClass = (rarity: Achievement['rarity']) => {
  if (rarity === 'legendary') return 'text-amber-300 border-amber-300/30'
  if (rarity === 'epic') return 'text-emerald-300 border-emerald-300/30'
  if (rarity === 'rare') return 'text-sky-300 border-sky-300/30'
  return 'text-zinc-400 border-white/10'
}

const AchievementCard = ({ achievement, compact }: AchievementCardProps) => {
  const progressPercent = achievement.total
    ? Math.min(
        100,
        Math.round(((achievement.progress || 0) / achievement.total) * 100),
      )
    : 0

  return (
    <article
      className={clsx(
        'rounded-2xl border border-white/10 bg-[var(--bg-card)] p-5 shadow-lg',
        compact ? 'p-4' : 'p-6',
      )}
      aria-label={achievement.title}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5',
              achievement.status === 'unlocked' &&
                'text-[var(--color-success)] border-[var(--color-success)]/30',
            )}
          >
            {achievement.status === 'locked' ? (
              <Lock size={18} />
            ) : achievement.status === 'in-progress' ? (
              <Sparkles size={18} />
            ) : (
              <Medal size={18} />
            )}
          </div>

          <div>
            <h4 className='text-sm font-bold text-white'>{achievement.title}</h4>
            <p className='text-xs text-[var(--text-muted)]'>
              {achievement.description}
            </p>
          </div>
        </div>

        <div className='flex flex-col items-end gap-2 text-[10px] uppercase tracking-wider'>
          <span
            className={clsx(
              'rounded-full border px-2 py-1 font-bold',
              getRarityClass(achievement.rarity),
            )}
          >
            {getRarityLabel(achievement.rarity)}
          </span>
          <span className='text-[var(--text-muted)]'>
            {getStatusLabel(achievement.status)}
          </span>
        </div>
      </div>

      {achievement.total ? (
        <div className='mt-4'>
          <div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
            <span>
              Прогрес: {achievement.progress || 0}/{achievement.total}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className='mt-2 h-2 rounded-full bg-white/10'>
            <div
              className={clsx(
                'h-2 rounded-full bg-[var(--color-primary)]',
                achievement.status === 'locked' && 'bg-white/10',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {achievement.pointsReward ? (
        <div className='mt-4 text-xs text-[var(--text-muted)]'>
          Нагорода: <span className='text-white'>{achievement.pointsReward} балів</span>
        </div>
      ) : null}
    </article>
  )
}

export default AchievementCard
