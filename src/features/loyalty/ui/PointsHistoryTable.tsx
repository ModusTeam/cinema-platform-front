import { History } from 'lucide-react'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import {
  formatSignedPoints,
  formatTransactionInfo,
  getTransactionPointsTone,
} from '../lib/loyaltyTransactionFormatters'
import type { LoyaltyTransaction } from '../model/loyalty.types'

interface PointsHistoryTableProps {
  transactions: LoyaltyTransaction[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error?: Error | null
  onLoadMore: () => void
  onRetry?: () => void
}

const PointsHistoryTable = ({
  transactions,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onRetry,
}: PointsHistoryTableProps) => {
  if (isLoading)
    return (
      <output className='block border-y border-[var(--border-default)] py-16 text-[var(--text-muted)]'>
        Завантажуємо історію балів…
      </output>
    )
  if (error && transactions.length === 0)
    return (
      <UnavailableState
        className='account-state'
        title='Історія тимчасово недоступна'
        onRetry={onRetry}
      />
    )
  if (transactions.length === 0)
    return (
      <EmptyState
        className='account-state'
        icon={<History className='h-12 w-12' />}
        title='Історія балів порожня'
        description='Нарахування, списання та бонуси зʼявляться тут після перших операцій у програмі лояльності.'
      />
    )
  return (
    <div>
      <div className='mb-1 flex justify-between border-b border-[var(--border-default)] pb-4 text-xs text-[var(--text-muted)]'>
        <span>Операція / дата</span>
        <span>Зміна / баланс</span>
      </div>
      <ol aria-label='Операції з балами'>
        {transactions.map(transaction => {
          const info = formatTransactionInfo(transaction)
          const tone = getTransactionPointsTone(transaction)
          return (
            <li
              key={transaction.id}
              className='grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-[var(--border-default)] py-6 sm:gap-10'
            >
              <div className='min-w-0'>
                <h2 className='type-public-title'>{info.title}</h2>
                <p className='mt-2 text-sm leading-relaxed text-[var(--text-muted)]'>
                  {info.subtitle}
                </p>
              </div>
              <div className='text-right tabular-nums'>
                <p className='text-xl font-medium'>
                  {formatSignedPoints(transaction)}
                  <span className='sr-only'> балів</span>
                </p>
                <p className='mt-1 text-xs text-[var(--text-muted)]'>
                  {tone === 'positive'
                    ? 'Нарахування'
                    : tone === 'negative'
                      ? 'Списання'
                      : 'Без змін'}
                </p>
                <p className='mt-3 text-xs text-[var(--text-muted)]'>
                  Баланс: {transaction.balanceAfter.toLocaleString('uk-UA')}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      {error && (
        <UnavailableState
          className='account-state'
          title='Не вдалося оновити історію'
          description='Завантажені операції залишилися на сторінці. Спробуйте ще раз.'
          onRetry={onRetry}
        />
      )}
      {hasMore && !error && (
        <div className='mt-8 flex justify-center'>
          <Button
            variant='secondary'
            onClick={onLoadMore}
            isLoading={isLoadingMore}
          >
            Завантажити ще
          </Button>
        </div>
      )}
    </div>
  )
}
export default PointsHistoryTable
