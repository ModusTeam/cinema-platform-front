import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { accountService } from '@/entities/account/api/account.service'
import { ordersService } from '@/entities/order/api/orders.service'
import { isHistoryOrder } from '@/entities/order/lib/orderPresentation'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { User } from '@/features/auth/model/auth.types'
import { useToast } from '@/shared/ui/toast/ToastContext'
import type { AccountSection } from '../config/accountNavigation'

export type TabType = AccountSection

export interface ProfileUpdateData {
  firstName: string
  lastName: string
  oldPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

const getStatusCode = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined
  }

  const response = (error as { response?: { status?: number } }).response
  return response?.status
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const useProfile = () => {
  const { user, logout, updateUser } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabType>('active-tickets')

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['account-profile', user?.id],
    queryFn: accountService.getProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const currentUser: User | null = useMemo(
    () =>
      user
        ? {
            ...user,
            dateOfBirth: profileData?.dateOfBirth ?? user.dateOfBirth,
          }
        : null,
    [profileData?.dateOfBirth, user],
  )

  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    isError: isTicketsError,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersService.getMyOrders,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    select: data => {
      return {
        active: data.filter(order => !isHistoryOrder(order)),
        history: data.filter(isHistoryOrder),
      }
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const promises: Promise<void>[] = []

      if (data.firstName !== user?.name || data.lastName !== user?.surname) {
        promises.push(
          accountService
            .updateProfile({
              firstName: data.firstName,
              lastName: data.lastName,
            })
            .then(() => {
              updateUser({ name: data.firstName, surname: data.lastName })
            }),
        )
      }

      if (data.newPassword) {
        promises.push(
          accountService.changePassword({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            confirmNewPassword: data.confirmNewPassword,
          }),
        )
      }

      if (promises.length === 0) return

      await Promise.all(promises)
    },
    onSuccess: () => {
      toast.success('Дані успішно оновлено')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Помилка збереження даних'))
    },
  })

  const setDateOfBirthMutation = useMutation({
    mutationFn: accountService.setMyDateOfBirth,
    onSuccess: data => {
      updateUser({ dateOfBirth: data.dateOfBirth })
      queryClient.invalidateQueries({ queryKey: ['account-profile'] })
      toast.success('Дату народження збережено')
    },
    onError: error => {
      const status = getStatusCode(error)

      if (status === 409) {
        toast.error('Дата народження вже встановлена і її не можна змінити.')
        return
      }

      if (status === 404) {
        toast.error('Не вдалося знайти користувача для оновлення профілю.')
        return
      }

      if (status === 400) {
        toast.error(getErrorMessage(error, 'Перевірте дату народження.'))
        return
      }

      toast.error(getErrorMessage(error, 'Не вдалося зберегти дату народження'))
    },
  })

  const updateProfileData = async (data: ProfileUpdateData) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      return true
    } catch {
      return false
    }
  }

  const setDateOfBirth = async (dateOfBirth: string) => {
    try {
      await setDateOfBirthMutation.mutateAsync({ dateOfBirth })
      return true
    } catch {
      return false
    }
  }

  return {
    user: currentUser,
    logout,
    updateUser,
    activeTab,
    setActiveTab,
    isLoadingProfile,
    isProfileError,
    refetchProfile,

    activeTickets: ticketsData?.active || [],
    historyOrders: ticketsData?.history || [],
    isLoadingTickets,
    isTicketsError,
    refetchTickets,

    isSaving: updateProfileMutation.isPending,
    updateProfileData,
    isSavingDateOfBirth: setDateOfBirthMutation.isPending,
    setDateOfBirth,
  }
}
