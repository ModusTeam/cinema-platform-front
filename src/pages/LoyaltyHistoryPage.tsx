import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import PointsHistoryTable from '@/features/loyalty/components/PointsHistoryTable'
import { useLoyaltyHistory } from '@/features/loyalty/hooks/useLoyaltyHistory'

const LoyaltyHistoryPage = () => {
  const historyQuery = useLoyaltyHistory()

  return (
    <div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]'>
      <div className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.015] blur-[100px]' />

      <div className='relative mx-auto max-w-4xl space-y-12 px-4 pb-16 pt-28'>
        <Link
          to='/account/loyalty'
          className='group mb-8 flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-white'
        >
          <ArrowLeft
            size={16}
            className='transition-transform group-hover:-translate-x-1'
          />
          Назад до огляду
        </Link>

        <header className='flex flex-col gap-2'>
          <h1 className='text-3xl font-medium tracking-tight text-white md:text-4xl'>
            Історія транзакцій
          </h1>
          <p className='text-sm text-neutral-500'>
            Нарахування та використання балів лояльності
          </p>
        </header>

        <PointsHistoryTable
          transactions={historyQuery.transactions}
          isLoading={historyQuery.isLoading}
          isLoadingMore={historyQuery.isLoadingMore}
          hasMore={historyQuery.hasMore}
          error={historyQuery.error}
          onLoadMore={() => {
            void historyQuery.loadMore()
          }}
        />
      </div>
    </div>
  )
}

export default LoyaltyHistoryPage
