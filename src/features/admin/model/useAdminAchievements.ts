import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type AdminAchievementPayload,
  adminAchievementsService,
} from '@/features/admin/api/admin-achievements.service'
import {
  ACHIEVEMENTS_PAGE_SIZE,
  achievementListKey,
  achievementPageOffset,
  invalidateAchievementQueries,
} from './achievementManagement'

export const useAdminAchievements = (
  includeInactive: boolean,
  page = 1,
  pageSize = ACHIEVEMENTS_PAGE_SIZE,
) => {
  const queryClient = useQueryClient()
  const queryKey = achievementListKey(page, pageSize, includeInactive)

  const achievementsQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      adminAchievementsService.getAll(
        includeInactive,
        pageSize,
        achievementPageOffset(page, pageSize),
        signal,
      ),
    staleTime: 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: AdminAchievementPayload) =>
      adminAchievementsService.create(payload),
    onSuccess: () => invalidateAchievementQueries(queryClient),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AdminAchievementPayload
    }) => adminAchievementsService.update(id, payload),
    onSuccess: () => invalidateAchievementQueries(queryClient),
  })

  const deactivateMutation = useMutation({
    mutationFn: adminAchievementsService.deactivate,
    onSuccess: () => invalidateAchievementQueries(queryClient),
  })

  return {
    achievements: achievementsQuery.data?.achievements || [],
    total: achievementsQuery.data?.total || 0,
    isLoading: achievementsQuery.isLoading,
    isFetching: achievementsQuery.isFetching,
    error: achievementsQuery.error,
    refetch: achievementsQuery.refetch,
    createAchievement: createMutation.mutateAsync,
    updateAchievement: updateMutation.mutateAsync,
    deactivateAchievement: deactivateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
  }
}
