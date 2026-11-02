import { Trophy } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import AchievementCollection from '@/features/loyalty/achievements/AchievementCollection'
import {
  ACHIEVEMENT_FILTERS,
  getCollectionCategory,
} from '@/features/loyalty/achievements/achievementCollectionModel'
import { useAchievementsTabData } from '@/features/loyalty/achievements/model/useAchievementsTabData'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'

export default function AchievementsPage() {
  const { data, error, isPending, fetchStatus, refetch } =
    useAchievementsTabData()
  const [params, setParams] = useSearchParams()
  const requestedCategory = params.get('category') ?? 'all'
  const category = data?.achievements.some(
    item => getCollectionCategory(item).key === requestedCategory,
  )
    ? requestedCategory
    : 'all'
  const requestedStatus = params.get('status') ?? 'all'
  const status = ACHIEVEMENT_FILTERS.some(
    filter => filter.value === requestedStatus,
  )
    ? requestedStatus
    : 'all'
  const onFilter = (name: 'category' | 'status', value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      if (value === 'all') next.delete(name)
      else next.set(name, value)
      return next
    })
  }
  const onReset = () =>
    setParams(previous => {
      const next = new URLSearchParams(previous)
      next.delete('category')
      next.delete('status')
      return next
    })
  return (
    <AccountPageLayout
      title='Ваші досягнення'
      description='Колекція ваших кіновражень. Відкриті досягнення та наступні цілі — кожне зі своєю історією.'
    >
      {isPending && fetchStatus !== 'paused' ? (
        <output className='block border-y border-[var(--account-rule)] py-16 text-[var(--account-muted)]'>
          Завантажуємо вашу колекцію…
        </output>
      ) : error || fetchStatus === 'paused' ? (
        <UnavailableState
          className='account-state'
          title='Досягнення тимчасово недоступні'
          description={
            fetchStatus === 'paused'
              ? 'Немає з’єднання. Колекція завантажиться після відновлення мережі.'
              : undefined
          }
          onRetry={() => void refetch()}
        />
      ) : !data || data.achievements.length === 0 ? (
        <EmptyState
          className='account-state'
          icon={<Trophy className='h-12 w-12' />}
          title='Досягнення ще попереду'
          description='Ваші досягнення зʼявлятимуться тут після відвідувань кіно.'
        />
      ) : (
        <AchievementCollection
          achievements={data.achievements}
          category={category}
          status={status}
          search={params.size ? `?${params.toString()}` : ''}
          onFilter={onFilter}
          onReset={onReset}
        />
      )}
    </AccountPageLayout>
  )
}
