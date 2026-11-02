import LoyaltyDashboard from '@/features/loyalty/ui/LoyaltyDashboard'
import { AccountPageLayout } from '@/features/profile/ui/AccountPageLayout'

const LoyaltyPage = () => (
  <AccountPageLayout
    title='Ваша лояльність'
    description='Ваша картка учасника, доступні бали та рік у кіно. Статус програми й колекція досягнень — поруч.'
  >
    <LoyaltyDashboard />
  </AccountPageLayout>
)
export default LoyaltyPage
