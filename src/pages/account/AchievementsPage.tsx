import { Trophy } from 'lucide-react'
import { useState } from 'react'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { useAchievementsTabData } from '@/features/loyalty/achievements/model/useAchievementsTabData'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'

const AchievementsPage = () => {
  const { data, error, isLoading, refetch } = useAchievementsTabData()
  const [category, setCategory] = useState('all')
  const categories = [
    ...new Map(
      data?.achievements.map(item => [item.category, item.categoryLabel]),
    ).entries(),
  ]
  const visible =
    data?.achievements.filter(
      item => category === 'all' || item.category === category,
    ) ?? []
  const nearest = data?.achievements
    .filter(
      item => item.status !== 'unlocked' && !item.isSecret && item.target > 0,
    )
    .sort((a, b) => b.progressPercent - a.progressPercent)[0]
  return (
    <AccountPageLayout
      title='Ваші досягнення'
      description='Колекція ваших кіновражень. Відкриті досягнення та наступні цілі — кожне зі своєю історією.'
    >
      {isLoading ? (
        <output className='block border-y border-[var(--account-rule)] py-16 text-[var(--account-muted)]'>
          Завантажуємо вашу колекцію…
        </output>
      ) : error ? (
        <UnavailableState
          className='account-state'
          title='Досягнення тимчасово недоступні'
          onRetry={() => {
            void refetch()
          }}
        />
      ) : !data || data.achievements.length === 0 ? (
        <EmptyState
          className='account-state'
          icon={<Trophy className='h-12 w-12' />}
          title='Досягнення ще попереду'
          description='Ваші досягнення зʼявлятимуться тут після відвідувань кіно.'
        />
      ) : (
        <>
          <div className='mb-9 flex flex-wrap items-baseline justify-between gap-4 border-y border-[var(--account-rule)] py-5'>
            <p className='text-lg tabular-nums'>
              Відкрито {data.summary.unlocked} з {data.summary.total}
            </p>
            <p className='text-sm text-[var(--account-muted)]'>
              У прогресі: {data.summary.inProgress} · Ще не відкрито:{' '}
              {data.summary.locked}
            </p>
          </div>
          {nearest && category === 'all' && (
            <div className='mb-10'>
              <AchievementCard achievement={nearest} featured />
            </div>
          )}
          <section aria-label='Колекція досягнень'>
            <div className='mb-5 flex flex-wrap items-center justify-between gap-5'>
              <h2 className='account-subheading'>Колекція</h2>
              <div className='flex min-w-0 flex-wrap items-center gap-3 text-sm'>
                <label htmlFor='achievement-category-filter'>Категорія</label>
                <select
                  id='achievement-category-filter'
                  value={category}
                  onChange={event => setCategory(event.target.value)}
                  className='field w-auto max-w-full'
                >
                  <option value='all'>Усі категорії</option>
                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <output className='mb-4 block text-xs text-[var(--account-muted)]'>
              Показано: {visible.length}
            </output>
            {visible.length === 0 ? (
              <EmptyState
                className='account-state'
                icon={<Trophy className='h-12 w-12' />}
                title='Досягнень у категорії немає'
                description='Оберіть іншу категорію або поверніться до всієї колекції.'
                actionLabel='Усі категорії'
                onAction={() => setCategory('all')}
              />
            ) : (
              <div className='grid gap-x-10 md:grid-cols-2 xl:grid-cols-3'>
                {visible
                  .filter(item => category !== 'all' || item.id !== nearest?.id)
                  .map(item => (
                    <AchievementCard key={item.id} achievement={item} />
                  ))}
              </div>
            )}
          </section>
        </>
      )}
    </AccountPageLayout>
  )
}
export default AchievementsPage
