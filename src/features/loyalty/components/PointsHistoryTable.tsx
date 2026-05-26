import type { LoyaltyHistoryItem } from '@/features/loyalty/api/loyalty.types'
import { clsx } from 'clsx'
import { AlertCircle } from 'lucide-react'

const LOADING_ROWS = [
  'history-loading-1',
  'history-loading-2',
  'history-loading-3',
  'history-loading-4',
]

interface PointsHistoryTableProps {
  items: LoyaltyHistoryItem[]
  isLoading: boolean
  isFetching: boolean
  hasMore: boolean
  error?: Error | null
  onLoadMore: () => void
}

const getTypeConfig = (type: LoyaltyHistoryItem['type']) => {
  switch (type) {
    case 'earn':
      return { label: 'Нараховано', color: 'text-emerald-400/90', sign: '+' }
    case 'redeem':
      return { label: 'Списано', color: 'text-neutral-300', sign: '-' }
    case 'bonus':
      return { label: 'Бонус', color: 'text-amber-400/90', sign: '+' }
    case 'expire':
      return { label: 'Закінчення', color: 'text-rose-400/80', sign: '-' }
    default:
      return { label: 'Інше', color: 'text-neutral-500', sign: '' }
  }
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
      <div className='flex flex-col'>
        {LOADING_ROWS.map(row => (
          <div
            key={row}
            className='flex h-20 items-center border-b border-white/5'
          >
            <div className='h-4 w-1/3 rounded bg-white/5 motion-safe:animate-pulse' />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='border-l-2 border-red-500/50 py-2 pl-4'>
        <div className='flex items-center gap-2 text-red-400'>
          <AlertCircle size={18} />
          <span className='font-medium'>Історія тимчасово недоступна</span>
        </div>
        <p className='mt-2 text-sm text-neutral-400'>
          Спробуйте оновити сторінку пізніше.
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='py-12 text-center text-sm text-neutral-500'>
        Історія балів ще не доступна в основному API.
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col'>
        {items.map(item => {
          const config = getTypeConfig(item.type)
          const displayPoints = Math.abs(item.points)

          return (
            <div
              key={item.id}
              className='group flex flex-col justify-between border-b border-white/5 py-6 transition-colors hover:border-white/10 md:flex-row md:items-center'
            >
              <div className='flex flex-col gap-1.5'>
                <span className='text-base font-medium text-white'>
                  {item.description}
                </span>
                <span className='text-xs text-neutral-500'>
                  {new Date(item.date).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  <span className='mx-2'>·</span>
                  {config.label}
                </span>
              </div>

              <div className='mt-4 flex items-baseline gap-1.5 md:mt-0'>
                <span className={clsx('text-lg font-medium', config.color)}>
                  {config.sign}
                  {displayPoints}
                </span>
                <span className='text-sm text-neutral-500'>балів</span>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className='flex justify-center pt-4'>
          <button
            type='button'
            onClick={onLoadMore}
            disabled={isFetching}
            className='group flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white disabled:opacity-50'
          >
            {isFetching ? 'Завантаження...' : 'Завантажити ще'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PointsHistoryTable
