import { useLoyaltyHistory } from '@/features/loyalty/model/useLoyaltyHistory'
import PointsHistoryTable from '@/features/loyalty/ui/PointsHistoryTable'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'

const LoyaltyHistoryPage = () => {
  const history = useLoyaltyHistory()
  return (
    <AccountPageLayout
      title='Історія балів'
      description='Нарахування, використання та коригування балів. Кожна операція — з датою та залишком на балансі.'
    >
      <PointsHistoryTable
        transactions={history.transactions}
        isLoading={history.isLoading}
        isLoadingMore={history.isLoadingMore}
        hasMore={history.hasMore}
        error={history.error}
        onLoadMore={() => {
          void history.loadMore()
        }}
        onRetry={() => {
          void history.refetch()
        }}
      />
    </AccountPageLayout>
  )
}
export default LoyaltyHistoryPage
