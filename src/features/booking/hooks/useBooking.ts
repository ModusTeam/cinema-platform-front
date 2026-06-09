import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../common/components/Toast/ToastContext'
import { bookingService } from '@/features/booking/api/booking.service'
import { moviesService } from '@/features/movies/api/movies.service'
import { ticketHub } from '@/features/booking/api/signalr.service'
import type { Hall, Seat, Session } from '@/features/halls/model/hall.types'
import { useAuth } from '../../auth/AuthContext'

interface CreateOrderPayload {
  seatIds: string[]
  useLoyaltyPoints: boolean
  applyGoldUpgrade: boolean
}

interface BookingQueryData {
  session: Session
  hall: Hall
}

interface ApiErrorLike {
  response?: {
    status?: number
    data?: {
      detail?: string
    }
  }
}

const isApiErrorLike = (error: unknown): error is ApiErrorLike =>
  typeof error === 'object' && error !== null && 'response' in error

export const useBooking = (movieId?: string) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])

  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => {
      if (!movieId) throw new Error('No movie selected')
      return moviesService.getById(movieId)
    },
    enabled: !!movieId,
    staleTime: 10 * 60 * 1000,
  })

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['movie-sessions', movieId],
    queryFn: () => {
      if (!movieId) throw new Error('No movie selected')
      return bookingService.getSessionsByMovieId(movieId)
    },
    enabled: !!movieId,
    select: data =>
      data
        .filter(s => new Date(s.startTime) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
  })

  const { data: bookingData, isLoading: isLoadingDetails } =
    useQuery<BookingQueryData>({
      queryKey: ['session-full-details', selectedSessionId],
      queryFn: async () => {
        if (!selectedSessionId) throw new Error('No session selected')
        const session =
          await bookingService.getSessionDetails(selectedSessionId)
        const hall = await bookingService.getHallById(session.hallId)
        return { session, hall }
      },
      enabled: !!selectedSessionId,
      staleTime: Infinity,
    })

  const updateOccupiedSeats = useCallback(
    (seatId: string, action: 'add' | 'remove') => {
      if (!selectedSessionId) return

      queryClient.setQueryData(
        ['session-full-details', selectedSessionId],
        (oldData: BookingQueryData | undefined) => {
          if (!oldData?.session) return oldData

          const currentOccupied = oldData.session.occupiedSeatIds || []
          const targetId = seatId.toString().toLowerCase()

          let newOccupied = [...currentOccupied]

          if (action === 'add') {
            const exists = currentOccupied.some(
              (id: string) => id.toString().toLowerCase() === targetId,
            )
            if (!exists) {
              newOccupied.push(seatId)
            }
          } else {
            newOccupied = currentOccupied.filter(
              (id: string) => id.toString().toLowerCase() !== targetId,
            )
          }

          return {
            ...oldData,
            session: {
              ...oldData.session,
              occupiedSeatIds: newOccupied,
            },
          }
        },
      )
    },
    [queryClient, selectedSessionId],
  )

  useEffect(() => {
    if (!selectedSessionId) return

    ticketHub.startConnection(selectedSessionId)

    ticketHub.onSeatLocked = (seatId, lockerUserId) => {
      updateOccupiedSeats(seatId, 'add')

      if (lockerUserId !== user?.id) {
        setSelectedSeats(prev => {
          const isSelected = prev.some(s => s.id === seatId)
          if (isSelected) {
            toast.warning('На жаль, це місце щойно зайняли.')
            return prev.filter(s => s.id !== seatId)
          }
          return prev
        })
      }
    }

    ticketHub.onSeatUnlocked = seatId => {
      updateOccupiedSeats(seatId, 'remove')
    }

    return () => {
      ticketHub.stopConnection()
    }
  }, [selectedSessionId, toast.warning, updateOccupiedSeats, user?.id])

  const lockSeatMutation = useMutation({
    mutationFn: (seatId: string) => {
      if (!selectedSessionId) throw new Error('No session selected')
      return bookingService.lockSeat(selectedSessionId, seatId)
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: ({
      seatIds,
      useLoyaltyPoints,
      applyGoldUpgrade,
    }: CreateOrderPayload) => {
      if (!selectedSessionId) throw new Error('No session selected')
      return bookingService.createOrder({
        sessionId: selectedSessionId,
        seatIds,
        useLoyaltyPoints,
        applyGoldUpgrade,
        paymentToken: 'test_token',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['session-full-details', selectedSessionId],
      })
      setStep(4)
      toast.success('Замовлення успішно створено!')
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['session-full-details', selectedSessionId],
      })
    },
  })

  const toggleSeat = async (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id)

    const occupiedList = bookingData?.session?.occupiedSeatIds || []
    const isOccupied = occupiedList.includes(seat.id)
    if (isOccupied && !isSelected) {
      toast.error('Це місце вже зайняте.')
      return
    }

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
    } else {
      setSelectedSeats(prev => [...prev, seat])
      try {
        await lockSeatMutation.mutateAsync(seat.id)
      } catch (error: unknown) {
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        if (isApiErrorLike(error) && error.response?.status === 409) {
          toast.error('Це місце щойно зайняли або воно заблоковане.')
        }
      }
    }
  }

  const selectSession = (session: Session) => {
    setSelectedSessionId(session.id)
    setStep(2)
  }

  const resetSession = () => {
    setStep(1)
    setSelectedSessionId(null)
    setSelectedSeats([])
  }

  const goToCheckout = () => {
    if (selectedSeats.length === 0) return
    setStep(3)
  }

  const backToSeats = () => {
    setStep(2)
  }

  const submitOrder = async (
    useLoyaltyPoints: boolean,
    applyGoldUpgrade: boolean,
  ) => {
    try {
      await createOrderMutation.mutateAsync({
        seatIds: selectedSeats.map(s => s.id),
        useLoyaltyPoints,
        applyGoldUpgrade,
      })
    } catch (error: unknown) {
      toast.error(
        isApiErrorLike(error) && error.response?.data?.detail
          ? error.response.data.detail
          : 'Помилка при створенні замовлення',
      )
    }
  }

  return {
    step,
    movie,
    sessions,
    selectedSession: bookingData?.session,
    hall: bookingData?.hall,
    selectedSeats,
    isLoading: isLoadingMovie || isLoadingSessions,
    isLoadingDetails,
    isProcessingPayment: createOrderMutation.isPending,
    selectSession,
    resetSession,
    goToCheckout,
    backToSeats,
    toggleSeat,
    submitOrder,
  }
}
