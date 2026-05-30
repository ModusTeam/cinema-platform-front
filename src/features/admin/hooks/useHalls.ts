import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hallsService } from '@/features/halls/api/halls.service'

export const useHalls = () => {
  const queryClient = useQueryClient()

  const { data: halls = [], isLoading } = useQuery({
    queryKey: ['admin-halls'],
    queryFn: hallsService.getAll,
    staleTime: 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: hallsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] })
    },
  })

  const deleteHall = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch (error) {
      return false
    }
  }

  return {
    halls,
    isLoading,
    fetchHalls: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] }),
    deleteHall,
  }
}
