import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../common/components/Toast/ToastContext'
import { adminPricingsService } from '@/features/admin/api/admin-pricings.service'
import { bookingService } from '@/features/booking/api/booking.service'
import { moviesService } from '@/features/movies/api/movies.service'
import { ticketHub } from '@/features/booking/api/signalr.service'
import type { Seat, Session } from '@/features/halls/model/hall.types'
import { useAuth } from '../../auth/AuthContext'

interface CreateOrderPayload {
  seatIds: string[]
  useLoyaltyPoints: boolean
  applyGoldUpgrade: boolean
}

export const useBooking = (movieId?: string) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])

  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => moviesService.getById(movieId!),
    enabled: !!movieId,
    staleTime: 10 * 60 * 1000,
  })

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['movie-sessions', movieId],
    queryFn: () => bookingService.getSessionsByMovieId(movieId!),
    enabled: !!movieId,
    select: data =>
      data
        .filter(s => new Date(s.startTime) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
  })

  const { data: bookingData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['session-full-details', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) throw new Error('No session selected')
      const session = await bookingService.getSessionDetails(selectedSessionId)
      const [hall, pricing] = await Promise.all([
        bookingService.getHallById(session.hallId),
        session.pricingId
          ? adminPricingsService.getById(session.pricingId)
          : null,
      ])
      return { session, hall, pricing }
    },
    enabled: !!selectedSessionId,
    staleTime: Infinity,
  })

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
  }, [selectedSessionId, user?.id])

  const updateOccupiedSeats = (seatId: string, action: 'add' | 'remove') => {
    queryClient.setQueryData(
      ['session-full-details', selectedSessionId],
      (oldData: any) => {
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
  }

  const lockSeatMutation = useMutation({
    mutationFn: (seatId: string) =>
      bookingService.lockSeat(selectedSessionId!, seatId),
  })

  const createOrderMutation = useMutation({
    mutationFn: ({
      seatIds,
      useLoyaltyPoints,
      applyGoldUpgrade,
    }: CreateOrderPayload) =>
      bookingService.createOrder({
        sessionId: selectedSessionId!,
        seatIds,
        useLoyaltyPoints,
        applyGoldUpgrade,
        paymentToken: 'test_token',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['session-full-details', selectedSessionId],
      })
      setStep(3)
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
      } catch (error: any) {
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        if (error.response?.status === 409) {
          toast.error('Це місце щойно зайняли або воно заблоковане.')
        }
      }
    }
  }

  const calculateSeatPrice = (seat: Seat): number => {
    const session = bookingData?.session
    const pricing = bookingData?.pricing

    if (!session) return 150
    if (!pricing?.items?.length) return session.priceBase || 150

    const dayOfWeek = new Date(session.startTime).getDay()
    const rule = pricing.items.find(
      item =>
        item.dayOfWeek === dayOfWeek &&
        String(item.seatTypeId).toLowerCase() ===
          String(seat.seatTypeId).toLowerCase(),
    )

    return rule ? rule.price : session.priceBase || 150
  }

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce(
      (sum, seat) => sum + calculateSeatPrice(seat),
      0,
    )
  }, [selectedSeats, bookingData])

  const selectSession = (session: Session) => {
    setSelectedSessionId(session.id)
    setStep(2)
  }

  const resetSession = () => {
    setStep(1)
    setSelectedSessionId(null)
    setSelectedSeats([])
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
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || 'Помилка при створенні замовлення',
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
    totalPrice,
    isLoading: isLoadingMovie || isLoadingSessions,
    isLoadingDetails,
    isProcessingPayment: createOrderMutation.isPending,
    selectSession,
    resetSession,
    toggleSeat,
    submitOrder,
  }
}
