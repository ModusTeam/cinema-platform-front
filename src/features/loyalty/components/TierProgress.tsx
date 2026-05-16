interface TierProgressProps {
  progressPercent: number
  currentPoints: number
  nextTierPoints?: number
  nextTierLabel?: string
}

const TierProgress = ({
  progressPercent,
  currentPoints,
  nextTierPoints,
  nextTierLabel,
}: TierProgressProps) => {
  const safePercent = Math.min(100, Math.max(0, progressPercent))

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
        <span>Прогрес до {nextTierLabel || 'наступного рівня'}</span>
        <span>{safePercent}%</span>
      </div>
      <div className='h-2 rounded-full bg-white/10'>
        <div
          className='h-2 rounded-full bg-[var(--color-primary)]'
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
        <span>{currentPoints} балів</span>
        <span>{nextTierPoints ? `${nextTierPoints} балів` : '—'}</span>
      </div>
    </div>
  )
}

export default TierProgress
