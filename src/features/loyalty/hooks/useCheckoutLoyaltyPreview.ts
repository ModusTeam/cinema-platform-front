import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { loyaltyService } from '@/features/loyalty/api/loyalty.service'

export const useCheckoutLoyaltyPreview = (orderTotal: number) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['loyalty-checkout-preview', user?.id, orderTotal],
    queryFn: () => loyaltyService.getCheckoutLoyaltyPreview(orderTotal),
    enabled: !!user && orderTotal > 0,
    staleTime: 60 * 1000,
  })
}
