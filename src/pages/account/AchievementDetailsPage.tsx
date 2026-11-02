import { ArrowLeft, Trophy } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AchievementDetails from '@/features/loyalty/achievements/AchievementDetails'
import { useAchievementsTabData } from '@/features/loyalty/achievements/model/useAchievementsTabData'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'

export default function AchievementDetailsPage() {
  const { id } = useParams()
  const { search } = useLocation()
  const { data, error, isPending, fetchStatus, refetch } =
    useAchievementsTabData()
  const achievement = data?.achievements.find(item => item.id === id)
  return (
    <AccountPageLayout title='Досягнення' description='' header={null}>
      <Link
        to={`/profile/achievements${search}`}
        className='account-link inline-flex min-h-11 items-center gap-2 text-sm'
      >
        <ArrowLeft size={16} aria-hidden='true' />
        До колекції
      </Link>
      {isPending && fetchStatus !== 'paused' ? (
        <div className='py-16'>
          <h1 className='account-subheading'>Досягнення</h1>
          <output className='mt-4 block'>Завантажуємо досягнення…</output>
        </div>
      ) : error || fetchStatus === 'paused' ? (
        <>
          <h1 className='account-subheading mt-8'>Досягнення</h1>
          <UnavailableState
            className='account-state'
            title='Досягнення тимчасово недоступне'
            description={
              fetchStatus === 'paused'
                ? 'Немає з’єднання. Досягнення завантажиться після відновлення мережі.'
                : undefined
            }
            onRetry={() => void refetch()}
          />
        </>
      ) : !achievement ? (
        <>
          <h1 className='account-subheading mt-8'>Досягнення недоступне</h1>
          <EmptyState
            className='account-state'
            icon={<Trophy className='h-12 w-12' />}
            title='Тут поки немає досягнення'
            description='Цього досягнення немає у вашій колекції. Поверніться до колекції, щоб переглянути доступні.'
          />
        </>
      ) : (
        <AchievementDetails achievement={achievement} />
      )}
    </AccountPageLayout>
  )
}
