import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { genresService } from '../../../services/genresService'

export const useGenres = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: genresService.getAll,
    staleTime: 60 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: ({
      externalId,
      name,
    }: {
      externalId: number | null
      name: string
    }) => genresService.create(externalId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ externalId, name }: { externalId: number; name: string }) =>
      genresService.update(externalId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (externalId: number) => genresService.delete(externalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })

  const createGenre = async (externalId: number | null, name: string) => {
    try {
      await createMutation.mutateAsync({ externalId, name })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Помилка створення жанру'
      return { success: false, error: msg }
    }
  }

  const updateGenre = async (externalId: number, name: string) => {
    try {
      await updateMutation.mutateAsync({ externalId, name })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Помилка оновлення'
      return { success: false, error: msg }
    }
  }

  const deleteGenre = async (externalId: number) => {
    try {
      await deleteMutation.mutateAsync(externalId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: 'Помилка видалення' }
    }
  }

  return {
    genres: data || [],
    isLoading,
    createGenre,
    updateGenre,
    deleteGenre,
  }
}
