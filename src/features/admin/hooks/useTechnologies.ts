import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { technologiesService } from '@/features/halls/api/technologies.service'

export const useTechnologies = () => {
  const queryClient = useQueryClient()

  const { data: technologies = [], isLoading } = useQuery({
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
    } catch (error: any) {
      const msg = error.response?.data?.title || 'Помилка створення'
      return { success: false, error: msg }
    }
  }

  return {
    technologies,
    isLoading,
    createTechnology,
  }
}
