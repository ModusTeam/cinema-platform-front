import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { adminSessionsService } from '@/features/admin/api/admin-sessions.service'

export const useSessions = () => {
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => adminSessionsService.getAll(1, 100),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    select: data =>
      [...data].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: adminSessionsService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
    },
  })

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDateIso }: { id: string; newDateIso: string }) =>
      adminSessionsService.reschedule(id, newDateIso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
    },
  })

  const deleteSession = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch (e) {
      return false
    }
  }

  const rescheduleSession = async (id: string, newDateIso: string) => {
    try {
      await rescheduleMutation.mutateAsync({ id, newDateIso })
      return { success: true }
    } catch (e: any) {
      const msg = e.response?.data?.errors?.Description || e.message
      return { success: false, error: msg }
    }
  }

  return {
    sessions,
    isLoading,
    fetchSessions: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] }),
    deleteSession,
    rescheduleSession,
  }
}
