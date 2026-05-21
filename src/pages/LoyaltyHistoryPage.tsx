import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Filter } from 'lucide-react'

import PointsHistoryTable from '@/features/loyalty/components/PointsHistoryTable'
import { useLoyaltyHistory } from '@/features/loyalty/hooks/useLoyaltyHistory'
import type { LoyaltyHistoryType } from '@/features/loyalty/api/loyalty.types'

type FilterType = LoyaltyHistoryType | 'all'

const LoyaltyHistoryPage = () => {
  const {
    items,
    hasMore,
    isLoading,
    isFetching,
    error,
    page,
    setPage,
  } = useLoyaltyHistory()

  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter(item => item.type === filter)
  }, [items, filter])

  return (
    <div className='min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]'>
      <div className='container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-10'>
        <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-wider'>
              <Filter size={14} />
              Історія балів
            </div>
            <h1 className='mt-2 text-3xl font-black text-white'>
              Транзакції лояльності
            </h1>
          </div>
          <Link
            to='/account/loyalty'
            className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10'
          >
            <ArrowLeft size={16} /> До огляду
          </Link>
        </header>

        <div className='flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[var(--bg-card)] p-4'>
          <label className='text-xs uppercase tracking-wider text-[var(--text-muted)]'>
            Фільтр
          </label>
          <select
            value={filter}
            onChange={event => setFilter(event.target.value as FilterType)}
            className='rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white'
          >
            <option value='all'>Усі</option>
            <option value='earn'>Нарахування</option>
            <option value='redeem'>Списання</option>
            <option value='bonus'>Бонуси</option>
            <option value='expire'>Закінчення</option>
          </select>
          <span className='text-xs text-[var(--text-muted)]'>
            Завантажено: {filtered.length}
          </span>
        </div>

        <PointsHistoryTable
          items={filtered}
          isLoading={isLoading && page === 1}
          isFetching={isFetching}
          hasMore={hasMore}
          error={error as Error | null}
          onLoadMore={() => setPage(page + 1)}
        />
      </div>
    </div>
  )
}

export default LoyaltyHistoryPage
