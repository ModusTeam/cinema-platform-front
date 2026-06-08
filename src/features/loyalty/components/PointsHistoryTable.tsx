import EmptyState from '@/common/components/EmptyState'
import {
  formatTransactionInfo,
  formatSignedPoints,
  getTransactionPointsTone,
} from '@/features/loyalty/api/loyaltyTransactionFormatters'
import type { LoyaltyTransaction } from '@/features/loyalty/api/loyalty.types'
import { cn } from '@/lib/utils'
import { AlertCircle, History } from 'lucide-react'

const LOADING_ROWS = [
  'history-loading-1',
  'history-loading-2',
  'history-loading-3',
  'history-loading-4',
]

interface PointsHistoryTableProps {
  transactions: LoyaltyTransaction[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error?: Error | null
  onLoadMore: () => void
}

const pointsToneClassName = {
  positive: 'text-emerald-400/90',
  negative: 'text-rose-400/85',
  neutral: 'text-neutral-300',
}

const PointsHistoryTable = ({
  transactions,
  isLoading,
  isLoadingMore,
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

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<History className='h-12 w-12' />}
        title='Історія балів порожня'
        description='Нарахування, списання та бонуси зʼявляться тут після перших операцій у програмі лояльності.'
        className='py-12'
      />
    )
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col'>
        {transactions.map(transaction => {
          const transactionInfo = formatTransactionInfo(transaction)
          const pointsTone = getTransactionPointsTone(transaction)

          return (
            <div
              key={transaction.id}
              className='group grid gap-4 border-b border-white/5 py-6 transition-colors hover:border-white/10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8'
            >
              <div className='min-w-0'>
                <span className='text-base font-medium text-white'>
                  {transactionInfo.title}
                </span>
                <p className='mt-1.5 text-sm leading-relaxed text-neutral-500'>
                  {transactionInfo.subtitle}
                </p>
              </div>

              <div className='sm:text-right'>
                <div className='flex items-baseline gap-1.5 sm:justify-end'>
                  <span
                    className={cn(
                      'text-lg font-medium',
                      pointsToneClassName[pointsTone],
                    )}
                  >
                    {formatSignedPoints(transaction)}
                  </span>
                  <span className='text-sm text-neutral-500'>балів</span>
                </div>
                <div className='mt-1 text-xs text-neutral-600'>
                  Баланс {transaction.balanceAfter}
                </div>
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
            disabled={isLoadingMore}
            className='group flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-5 text-sm text-neutral-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoadingMore ? 'Завантаження...' : 'Завантажити ще'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PointsHistoryTable
