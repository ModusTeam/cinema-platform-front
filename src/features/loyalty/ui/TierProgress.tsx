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
  const remainingPoints =
    nextTierPoints !== undefined
      ? Math.max(0, nextTierPoints - currentPoints)
      : undefined
  const progressLabel =
    nextTierLabel && remainingPoints !== undefined
      ? `${remainingPoints} балів до ${nextTierLabel}`
      : `Прогрес до ${nextTierLabel || 'наступного рівня'}`

  if (!nextTierLabel || nextTierPoints === undefined) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-[var(--text-muted)]'>
        Максимальний рівень досягнуто
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
        <span>{progressLabel}</span>
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
