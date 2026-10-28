import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAchievementsTabData } from '@/features/loyalty/achievements/model/useAchievementsTabData'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'

export default function AccountAchievements() {
  const { data, error, isLoading, refetch } = useAchievementsTabData()
  if (isLoading)
    return <output className='py-12'>Завантажуємо досягнення…</output>
  if (error)
    return (
      <UnavailableState
        className='account-state'
        title='Досягнення тимчасово недоступні'
        onRetry={() => void refetch()}
      />
    )
  const recent =
    data?.achievements.filter(item => item.status === 'unlocked').slice(0, 3) ??
    []
  const inProgress = data?.achievements.find(
    item => item.status === 'in-progress',
  )
  const preview = [...recent, ...(inProgress ? [inProgress] : [])]
  return (
    <div>
      <Link
        className='account-link inline-flex min-h-11 items-center'
        to='/profile/achievements'
      >
        Усі досягнення ↗
      </Link>
      {preview.length === 0 ? (
        <EmptyState
          className='account-state'
          icon={<Trophy className='h-12 w-12' />}
          title='Відкритих досягнень поки немає'
          description='Ваші досягнення з’являтимуться тут після відвідувань кіно.'
        />
      ) : (
        <ul className='mt-6'>
          {preview.map(item => (
            <li
              key={item.id}
              className='border-t border-[var(--account-rule)] py-6'
            >
              <p className='mb-2 text-xs text-[var(--account-muted)]'>
                {item.status === 'unlocked' ? 'Відкрито' : 'У прогресі'}
              </p>
              <h2 className='account-subheading'>{item.title}</h2>
              <p className='mt-2 text-xs text-[var(--account-muted)]'>
                {item.categoryLabel} · {item.rarityLabel}
              </p>
              <p className='mt-2 text-sm leading-relaxed text-[var(--account-muted)]'>
                {item.description}
              </p>
              {item.status === 'in-progress' && item.target > 0 && (
                <>
                  <p className='mt-4 text-sm tabular-nums'>
                    {item.current} / {item.target}
                  </p>
                  <progress
                    className='account-progress mt-2 w-full'
                    aria-label={`Прогрес: ${item.title}`}
                    value={item.progressPercent}
                    max={100}
                  />
                </>
              )}
              {item.pointsReward > 0 && (
                <p className='mt-3 text-sm'>+{item.pointsReward} балів</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
