import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { hallsService } from '@/entities/hall/api/halls.service'
import { normalizeId } from '@/shared/lib/normalizeId'
import { bookingCopy } from '../config/booking.copy'
import { classifySeat, ownsSeatLock } from '../lib/seatState'
import { SeatSelection } from './seatSelection'
import { useSeatOccupancy } from './useSeatOccupancy'
import type { Hall, Seat } from '@/entities/hall/model/hall.types'
import { moviesService } from '@/entities/movie/api/movies.service'
import { sessionsService } from '@/entities/session/api/sessions.service'
import type { Session } from '@/entities/session/model/session.types'
import { useAuth } from '@/features/auth/model/AuthContext'
import { bookingService } from '@/features/booking/api/booking.service'
import { ticketHub } from '@/features/booking/api/signalr.service'
import { useToast } from '@/shared/ui/toast/ToastContext'

interface CreateOrderPayload {
  sessionId: string
  seatIds: string[]
  useLoyaltyPoints: boolean
  applyGoldUpgrade: boolean
}

interface BookingQueryData {
  session: Session
  hall: Hall
}

export const useBooking = (movieId?: string) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const occupancy = useSeatOccupancy(
    selectedSessionId,
    user?.id,
    step === 2 || step === 3,
  )
  const { refresh: refreshOccupancy } = occupancy
  const selection = useMemo(
    () =>
      new SeatSelection(selectedSessionId || '', {
        lock: bookingService.lockSeat,
        unlock: bookingService.unlockSeat,
        refresh: refreshOccupancy,
        warn: key => toast.warning(bookingCopy.availability[key]),
      }),
    [selectedSessionId, user?.id, refreshOccupancy, toast.warning],
  )
  const orderAttempt = useRef(false)
  const currentSelection = useRef(selection)
  currentSelection.current = selection
  const selectionSnapshot = useSyncExternalStore(
    selection.subscribe,
    selection.getSnapshot,
  )
  const selectedSeats = selectionSnapshot.seats

  useEffect(() => {
    selection.activate()
    // Generic unmount cannot establish whether another tab is using the lock.
    // Explicit session/back navigation below releases this tab's fresh locks.
    return () => selection.abandon(false)
  }, [selection])

  useEffect(() => {
    if (occupancy.data) selection.reconcile(occupancy.data)
  }, [occupancy.data, selection])

  const {
    data: movie,
    isLoading: isLoadingMovie,
    isError: isMovieError,
    refetch: refetchMovie,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => {
      if (!movieId) throw new Error('No movie selected')
      return moviesService.getById(movieId)
    },
    enabled: !!movieId,
    staleTime: 10 * 60 * 1000,
  })

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['movie-sessions', movieId],
    queryFn: () => {
      if (!movieId) throw new Error('No movie selected')
      return sessionsService.getByMovieId(movieId)
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

  const {
    data: bookingData,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useQuery<BookingQueryData>({
    queryKey: ['session-full-details', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) throw new Error('No session selected')
      const session = await sessionsService.getDetails(selectedSessionId)
      const hall = await hallsService.getById(session.hallId)
      return { session, hall }
    },
    enabled: !!selectedSessionId,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!selectedSessionId || step === 1 || step === 4) return
    let active = true
    const refresh = () => {
      if (active) void refreshOccupancy()
    }
    ticketHub.onSeatLocked = refresh
    ticketHub.onSeatUnlocked = refresh
    ticketHub.onSynchronized = refresh
    void ticketHub.startConnection(selectedSessionId)
    return () => {
      active = false
      ticketHub.onSeatLocked = null
      ticketHub.onSeatUnlocked = null
      ticketHub.onSynchronized = null
      void ticketHub.stopConnection()
    }
  }, [selectedSessionId, step === 1 || step === 4, refreshOccupancy])

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      bookingService.createOrder({
        ...payload,
        paymentToken: 'test_token',
      }),
  })

  const occupancyById = new Map(
    occupancy.data?.seats.map(seat => [normalizeId(seat.id), seat]),
  )
  const canCheckout =
    occupancy.verified &&
    selectedSeats.length > 0 &&
    selectionSnapshot.pending.size === 0 &&
    selectedSeats.every(seat =>
      ownsSeatLock(occupancyById.get(normalizeId(seat.id))),
    )

  const toggleSeat = (seat: Seat) => {
    const id = normalizeId(seat.id)
    const selected = selectedSeats.some(value => normalizeId(value.id) === id)
    const state = classifySeat(
      seat,
      occupancyById.get(id),
      selected,
      selectionSnapshot.pending.has(id),
    )
    if (state === 'pending') return
    if (!selected && (!occupancy.verified || state !== 'available')) return
    void selection.toggle(seat, ownsSeatLock(occupancyById.get(id)))
  }

  const selectSession = (session: Session) => {
    if (createOrderMutation.isPending) return
    selection.abandon(true)
    setSelectedSessionId(normalizeId(session.id))
    setStep(2)
  }

  const resetSession = () => {
    if (createOrderMutation.isPending) return
    selection.abandon(true)
    setStep(1)
    setSelectedSessionId(null)
  }

  const goToCheckout = () => {
    if (!canCheckout) return
    setStep(3)
  }

  const backToSeats = () => {
    setStep(2)
  }

  const submitOrder = async (
    useLoyaltyPoints: boolean,
    applyGoldUpgrade: boolean,
  ) => {
    if (
      !selectedSessionId ||
      !canCheckout ||
      orderAttempt.current ||
      createOrderMutation.isPending
    )
      return
    orderAttempt.current = true
    const owner = selection
    const sessionId = selectedSessionId
    owner.setSubmitting(true)
    try {
      const verified = await refreshOccupancy()
      owner.setSubmitting(false)
      if (currentSelection.current !== owner || !owner.isActive() || !verified)
        return
      owner.reconcile(verified)
      const seats = owner.getSnapshot()
      const latest = new Map(
        verified.seats.map(seat => [normalizeId(seat.id), seat]),
      )
      if (
        !seats.seats.length ||
        seats.seats.length !== selectedSeats.length ||
        seats.pending.size ||
        !seats.seats.every(seat =>
          ownsSeatLock(latest.get(normalizeId(seat.id))),
        )
      )
        return
      owner.setSubmitting(true)
      await createOrderMutation.mutateAsync({
        sessionId,
        seatIds: seats.seats.map(seat => seat.id),
        useLoyaltyPoints,
        applyGoldUpgrade,
      })
      owner.complete()
      void queryClient.invalidateQueries({
        queryKey: ['session-full-details', sessionId],
      })
      void queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['loyalty-profile'] })
      void queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] })
      if (currentSelection.current === owner && owner.isActive()) {
        setStep(4)
        toast.success('Замовлення успішно створено!')
      }
    } catch (error: unknown) {
      if (currentSelection.current === owner && owner.isActive()) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Помилка при створенні замовлення',
        )
        void refreshOccupancy()
      }
    } finally {
      orderAttempt.current = false
      owner.setSubmitting(false)
    }
  }

  return {
    step,
    movie,
    sessions,
    selectedSession: bookingData?.session,
    hall: bookingData?.hall,
    selectedSeats,
    occupancy: occupancy.data,
    pendingSeatIds: selectionSnapshot.pending,
    isAvailabilityError: occupancy.isError,
    isAvailabilityVerified: occupancy.verified,
    refreshOccupancy,
    canCheckout,
    isLoading: isLoadingMovie || isLoadingSessions,
    isMovieError,
    isSessionsError,
    isDetailsError,
    refetchMovie,
    refetchSessions,
    refetchDetails,
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
