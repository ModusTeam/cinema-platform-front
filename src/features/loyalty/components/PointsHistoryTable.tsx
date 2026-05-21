import { AlertCircle } from 'lucide-react'

import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'

interface PointsHistoryTableProps {
  items: LoyaltyHistoryItem[]
  isLoading: boolean
  isFetching: boolean
  hasMore: boolean
  error?: Error | null
  onLoadMore: () => void
}

const getTypeLabel = (type: LoyaltyHistoryItem['type']) => {
  if (type === 'earn') return 'Нараховано'
  if (type === 'redeem') return 'Списано'
  if (type === 'bonus') return 'Бонус'
  return 'Закінчення'
}

const PointsHistoryTable = ({
  items,
  isLoading,
  isFetching,
  hasMore,
  error,
  onLoadMore,
}: PointsHistoryTableProps) => {
  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='h-16 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none'
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
        <div className='flex items-center gap-2 text-red-200'>
          <AlertCircle size={18} />
          <span className='font-semibold'>Історія тимчасово недоступна</span>
        </div>
        <p className='mt-2 text-sm text-red-100/80'>
          Спробуйте оновити сторінку пізніше.
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-[var(--text-muted)]'>
        Історія операцій поки що порожня.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        {items.map(item => (
          <div
            key={item.id}
            className='flex flex-col gap-2 rounded-2xl border border-white/10 bg-[var(--bg-card)] p-4 md:flex-row md:items-center md:justify-between'
          >
            <div>
              <div className='text-sm font-semibold text-white'>
                {item.description}
              </div>
              <div className='text-xs text-[var(--text-muted)]'>
                {new Date(item.date).toLocaleDateString('uk-UA')} ·{' '}
                {getTypeLabel(item.type)}
              </div>
            </div>
            <div className='text-right text-sm font-bold text-white'>
              {item.points > 0 ? '+' : ''}
              {item.points} балів
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-center'>
        <button
          type='button'
          onClick={onLoadMore}
          disabled={!hasMore || isFetching}
          className='rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10 disabled:opacity-40'
        >
          {hasMore ? (isFetching ? 'Завантаження...' : 'Завантажити ще') : 'Більше немає'}
        </button>
      </div>
    </div>
  )
}

export default PointsHistoryTable
