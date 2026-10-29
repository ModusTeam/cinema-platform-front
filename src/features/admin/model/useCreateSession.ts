import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { hallsService } from '@/entities/hall/api/halls.service'
import { moviesService } from '@/entities/movie/api/movies.service'
import { adminSessionsService } from '@/features/admin/api/admin-sessions.service'
import { useToast } from '@/shared/ui/toast/ToastContext'

export const useCreateSession = (
  isOpen: boolean,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [submitError, setSubmitError] = useState('')
  const [movieId, setMovieId] = useState('')
  const [hallId, setHallId] = useState('')
  const [pricingId, setPricingId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('18:00')

  const moviesQuery = useQuery({
    queryKey: ['admin-movies-list'],
    queryFn: () => moviesService.getAll(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const hallsQuery = useQuery({
    queryKey: ['halls'],
    queryFn: hallsService.getAll,
    enabled: isOpen,
    staleTime: 30 * 60 * 1000,
  })

  const pricingsQuery = useQuery({
    queryKey: ['pricings-lookup'],
    queryFn: adminSessionsService.getPricingsLookup,
    enabled: isOpen,
    staleTime: 30 * 60 * 1000,
  })

  const isLoadingData =
    moviesQuery.isLoading || hallsQuery.isLoading || pricingsQuery.isLoading
  const isDataError =
    moviesQuery.isError || hallsQuery.isError || pricingsQuery.isError
  const retryData = () =>
    Promise.all([
      moviesQuery.refetch(),
      hallsQuery.refetch(),
      pricingsQuery.refetch(),
    ])

  useEffect(() => {
    if (isOpen && !isLoadingData) {
      if (!movieId && moviesQuery.data?.length)
        setMovieId(moviesQuery.data[0].id)
      if (!hallId && hallsQuery.data?.length) setHallId(hallsQuery.data[0].id)
      if (!pricingId && pricingsQuery.data?.length)
        setPricingId(pricingsQuery.data[0].id)
    }
  }, [
    isOpen,
    isLoadingData,
    moviesQuery.data,
    hallsQuery.data,
    pricingsQuery.data,
    movieId,
    hallId,
    pricingId,
  ])

  const createMutation = useMutation({
    mutationFn: adminSessionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['movie-sessions', movieId] })
      toast.success('Сеанс успішно створено')
      onSuccess()
      onClose()
      setTime('18:00')
    },
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createMutation.isPending) return
    setSubmitError('')
    if (!movieId || !hallId || !pricingId || !date || !time) {
      setSubmitError('Будь ласка, заповніть всі поля')
      return
    }

    const startDateTime = new Date(`${date}T${time}`)

    try {
      await createMutation.mutateAsync({
        movieId,
        hallId,
        startTime: startDateTime.toISOString(),
        pricingId,
      })
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : 'Помилка створення сеансу',
      )
    }
  }

  return {
    movies: moviesQuery.data || [],
    halls: hallsQuery.data || [],
    pricings: pricingsQuery.data || [],

    movieId,
    setMovieId,
    hallId,
    setHallId,
    pricingId,
    setPricingId,
    date,
    setDate,
    time,
    setTime,

    isLoadingData,
    isDataError,
    retryData,
    submitError,
    isSubmitting: createMutation.isPending,
    submit,
  }
}
