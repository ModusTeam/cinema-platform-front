import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
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
            <li key={item.id}>
              <AchievementCard achievement={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
