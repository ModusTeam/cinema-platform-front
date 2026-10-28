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
  if (!nextTierLabel || nextTierPoints === undefined)
    return (
      <p className='text-sm text-[var(--text-muted)]'>
        Максимальний рівень досягнуто
      </p>
    )
  const remaining = Math.max(0, nextTierPoints - currentPoints)
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap justify-between gap-2 text-sm'>
        <span>До {nextTierLabel}</span>
        <span className='tabular-nums text-[var(--text-muted)]'>
          Ще {remaining.toLocaleString('uk-UA')} балів
        </span>
      </div>
      <progress
        className='account-progress w-full'
        aria-label={`Прогрес до ${nextTierLabel}`}
        aria-valuetext={`${currentPoints} з ${nextTierPoints} балів`}
        max={100}
        value={Math.min(100, Math.max(0, progressPercent))}
      />
      <p className='text-xs text-[var(--text-muted)]'>
        Поріг рівня — {nextTierPoints.toLocaleString('uk-UA')} балів
      </p>
    </div>
  )
}
export default TierProgress
