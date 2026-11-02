import { Trophy } from 'lucide-react'
import EmptyState from '@/shared/ui/EmptyState'
import AchievementCollectionItem from './AchievementCollectionItem'
import {
  ACHIEVEMENT_FILTERS,
  filterAchievements,
  getCollectionCategory,
  selectFeaturedAchievement,
} from './achievementCollectionModel'
import type { Achievement } from './achievements.types'
import './achievementCollection.css'

interface AchievementCollectionProps {
  achievements: Achievement[]
  category: string
  status: string
  search: string
  onFilter: (name: 'category' | 'status', value: string) => void
  onReset: () => void
}

export default function AchievementCollection({
  achievements,
  category,
  status,
  search,
  onFilter,
  onReset,
}: AchievementCollectionProps) {
  const categories = new Map(
    achievements.map(item => {
      const category = getCollectionCategory(item)
      return [category.key, category.label]
    }),
  )
  const categoryItems = filterAchievements(achievements, category, 'all')
  const visible = filterAchievements(achievements, category, status)
  const featured = selectFeaturedAchievement(visible)
  const gallery = visible.filter(item => item.id !== featured?.id)
  const unlocked = achievements.filter(
    item => item.status === 'unlocked',
  ).length

  return (
    <>
      <div className='mb-8 flex flex-wrap items-baseline justify-between gap-3 border-y border-[var(--account-rule)] py-5'>
        <p className='text-lg tabular-nums'>
          Відкрито {unlocked} з {achievements.length}
        </p>
        <p className='text-sm text-[var(--account-muted)]'>
          Кожне досягнення — частина вашої кіноісторії.
        </p>
      </div>
      <section aria-labelledby='achievement-collection-heading'>
        <div className='flex flex-wrap items-center justify-between gap-5'>
          <h2
            id='achievement-collection-heading'
            className='account-subheading'
          >
            Колекція
          </h2>
          <div className='flex min-w-0 flex-wrap items-center gap-3 text-sm'>
            <label htmlFor='achievement-category-filter'>Категорія</label>
            <select
              id='achievement-category-filter'
              className='field min-h-11 w-auto max-w-full'
              value={category}
              onChange={event => onFilter('category', event.target.value)}
            >
              <option value='all'>Усі категорії</option>
              {[...categories].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <fieldset
          aria-label='Статус досягнення'
          className='my-5 flex flex-wrap gap-x-5 gap-y-1 border-b border-[var(--account-rule)] pb-4'
        >
          {ACHIEVEMENT_FILTERS.map(filter => (
            <button
              key={filter.value}
              type='button'
              aria-pressed={status === filter.value}
              className='account-section-link gap-2 text-sm tabular-nums'
              onClick={() => onFilter('status', filter.value)}
            >
              <span
                className={
                  status === filter.value ? 'underline underline-offset-4' : ''
                }
              >
                {filter.label}
              </span>
              <span>
                (
                {filter.value === 'all'
                  ? categoryItems.length
                  : categoryItems.filter(item => item.status === filter.value)
                      .length}
                )
              </span>
            </button>
          ))}
        </fieldset>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <output className='text-xs text-[var(--account-muted)]'>
            Показано: {visible.length}
          </output>
          {(category !== 'all' || status !== 'all') && (
            <button
              type='button'
              className='account-link min-h-11 text-sm'
              onClick={onReset}
            >
              Скинути фільтри
            </button>
          )}
        </div>
        {visible.length === 0 ? (
          <EmptyState
            className='account-state'
            icon={<Trophy className='h-12 w-12' />}
            title='За цими фільтрами досягнень немає'
            description='Оберіть іншу категорію чи статус або поверніться до всієї колекції.'
            actionLabel='Скинути фільтри'
            onAction={onReset}
          />
        ) : (
          <>
            {featured && (
              <div className='mb-4'>
                <AchievementCollectionItem
                  achievement={featured}
                  featured
                  search={search}
                />
              </div>
            )}
            <ul className='grid grid-cols-1 gap-x-6 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-10'>
              {gallery.map(item => (
                <li key={item.id} className='min-w-0'>
                  <AchievementCollectionItem
                    achievement={item}
                    search={search}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
