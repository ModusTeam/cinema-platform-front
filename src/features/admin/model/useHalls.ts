import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hallsService } from '@/entities/hall/api/halls.service'

export const useHalls = () => {
  const queryClient = useQueryClient()

  const { data: halls = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-halls'],
    queryFn: hallsService.getAll,
    staleTime: 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: hallsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] })
      queryClient.invalidateQueries({ queryKey: ['halls'] })
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
    isError,
    refetch,
    fetchHalls: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] }),
    deleteHall,
  }
}
