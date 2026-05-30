import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type AdminAchievementPayload,
  adminAchievementsService,
} from '@/features/admin/api/admin-achievements.service'

export const useAdminAchievements = (includeInactive: boolean) => {
  const queryClient = useQueryClient()
  const queryKey = ['admin-achievements', includeInactive]

  const achievementsQuery = useQuery({
    queryKey,
    queryFn: () => adminAchievementsService.getAll(includeInactive),
    staleTime: 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: AdminAchievementPayload) =>
      adminAchievementsService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AdminAchievementPayload
    }) => adminAchievementsService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminAchievementsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    achievements: achievementsQuery.data?.achievements || [],
    total: achievementsQuery.data?.total || 0,
    isLoading: achievementsQuery.isLoading,
    error: achievementsQuery.error,
    createAchievement: createMutation.mutateAsync,
    updateAchievement: updateMutation.mutateAsync,
    deleteAchievement: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
