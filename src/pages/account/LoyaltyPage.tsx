import LoyaltyDashboard from '@/features/loyalty/ui/LoyaltyDashboard'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'

const LoyaltyPage = () => (
  <AccountPageLayout
    title='Ваша лояльність'
    description='Поточний статус, баланс балів та шлях до наступного рівня. Усе про вашу участь у програмі — в одному місці.'
  >
    <LoyaltyDashboard />
  </AccountPageLayout>
)
export default LoyaltyPage
