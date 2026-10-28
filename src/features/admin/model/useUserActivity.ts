import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminOrdersService } from '@/features/admin/api/admin-orders.service'
import { adminTicketsService } from '@/features/admin/api/admin-tickets.service'
import { adminUsersService } from '@/features/admin/api/admin-users.service'
import { useToast } from '@/shared/ui/toast/ToastContext'

export const useUserActivity = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUsersService.getAll,
    staleTime: 5 * 60 * 1000,
  })

  const usersList = usersQuery.data ?? []

  const userDataQuery = useQuery({
    queryKey: ['admin-user-orders', selectedUserId],
    queryFn: () => adminOrdersService.getUserOrders(selectedUserId),
    enabled: !!selectedUserId,
    staleTime: 0,
    select: data => {
      const allTickets = data
        .flatMap(order =>
          order.tickets.map(ticket => ({
            ...ticket,
            orderId: order.id,
          })),
        )
        .sort(
          (a, b) =>
            new Date(b.sessionStart).getTime() -
            new Date(a.sessionStart).getTime(),
        )

      return {
        orders: data,
        tickets: allTickets,
      }
    },
  })

  const validateMutation = useMutation({
    mutationFn: adminTicketsService.validate,
    onSuccess: message => {
      toast.success(message)
      queryClient.invalidateQueries({
        queryKey: ['admin-user-orders', selectedUserId],
      })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Помилка валідації')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: adminOrdersService.cancelOrder,
    onSuccess: () => {
      toast.success('Замовлення скасовано')
      queryClient.invalidateQueries({
        queryKey: ['admin-user-orders', selectedUserId],
      })
    },
  })

  const validateTicket = (ticketId: string) => {
    if (!validateMutation.isPending) validateMutation.mutate(ticketId)
  }

  const cancelOrder = (orderId: string) => {
    if (!cancelMutation.isPending) setCancelTarget(orderId)
  }
  const confirmCancel = async () => {
    if (!cancelTarget || cancelMutation.isPending) return
    await cancelMutation.mutateAsync(cancelTarget)
    setCancelTarget(null)
  }

  const selectUser = (id: string) => {
    if (id === selectedUserId) return
    setSelectedUserId(id)
  }

  return {
    users: usersList,
    isLoadingUsers: usersQuery.isLoading,
    isUsersError: usersQuery.isError,
    refetchUsers: usersQuery.refetch,

    selectedUserId,
    selectUser,

    orders: userDataQuery.data?.orders || [],
    tickets: userDataQuery.data?.tickets || [],
    isLoadingData: userDataQuery.isFetching,
    isDataError: userDataQuery.isError,
    refetchData: userDataQuery.refetch,

    cancelTarget,
    setCancelTarget,
    confirmCancel,
    isCancelling: cancelMutation.isPending,
    isValidating: validateMutation.isPending,
    validateTicket,
    cancelOrder,
  }
}
