import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  adminPricingsService,
  type SetPricingRuleDto,
} from '@/features/admin/api/admin-pricings.service'

export const usePricings = () => {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['pricings-list'],
    queryFn: adminPricingsService.getAll,
    staleTime: 5 * 60 * 1000,
  })

  const detailQueries = useQueries({
    queries: (listQuery.data || []).map(pricing => ({
      queryKey: ['pricing-details', pricing.id],
      queryFn: () => adminPricingsService.getById(pricing.id),
      staleTime: 5 * 60 * 1000,
      enabled: !!listQuery.data,
    })),
  })

  const pricings =
    listQuery.data?.map((pricing, index) => {
      const detail = detailQueries[index]
      return detail.data || pricing
    }) || []

  const isLoading = listQuery.isLoading || detailQueries.some(q => q.isLoading)

  const createMutation = useMutation({
    mutationFn: adminPricingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricings-list'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, rules }: { id: string; rules: SetPricingRuleDto[] }) =>
      adminPricingsService.setRules(id, rules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pricing-details', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['pricings-list'] })
    },
  })

  const createPricing = async (name: string) => {
    try {
      await createMutation.mutateAsync(name)
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.title || 'Failed to create pricing'
      return { success: false, error: msg }
    }
  }

  const updateRules = async (id: string, rules: SetPricingRuleDto[]) => {
    try {
      await updateMutation.mutateAsync({ id, rules })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.title || 'Failed to update rules'
      return { success: false, error: msg }
    }
  }

  return {
    pricings,
    isLoading,
    createPricing,
    updateRules,
  }
}
