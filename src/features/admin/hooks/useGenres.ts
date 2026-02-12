import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { genresService } from '../../../services/genresService'

export const useGenres = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: genresService.getAll,
    staleTime: 0,
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
      return queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      genresService.update(id, name),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => genresService.delete(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['genres'] })
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

  const updateGenre = async (id: string, name: string) => {
    try {
      await updateMutation.mutateAsync({ id, name })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Помилка оновлення'
      return { success: false, error: msg }
    }
  }

  const deleteGenre = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
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
