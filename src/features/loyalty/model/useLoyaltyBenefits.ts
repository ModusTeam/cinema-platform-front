import { useQuery } from '@tanstack/react-query'

import { loyaltyService } from '@/features/loyalty/api/loyalty.service'

export const useLoyaltyBenefits = () => {
  return useQuery({
    queryKey: ['loyalty-benefits'],
    queryFn: () => loyaltyService.getLoyaltyBenefits(),
    staleTime: 10 * 60 * 1000,
  })
}
