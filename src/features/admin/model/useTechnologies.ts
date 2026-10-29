import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { technologiesService } from '@/entities/hall/api/technologies.service'

export const useTechnologies = () => {
  const queryClient = useQueryClient()

  const {
    data: technologies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['technologies'],
    queryFn: technologiesService.getAll,
    staleTime: Infinity,
  })

  const createMutation = useMutation({
    mutationFn: ({ name, type }: { name: string; type: string }) =>
      technologiesService.create(name, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
    },
  })

  const createTechnology = async (name: string, type: string) => {
    try {
      await createMutation.mutateAsync({ name, type })
      return { success: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Помилка створення'
      return { success: false, error: msg }
    }
  }

  return {
    technologies,
    isLoading,
    isError,
    refetch,
    createTechnology,
  }
}
