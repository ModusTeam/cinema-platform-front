import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { hallsService } from '@/features/halls/api/halls.service'
import { bookingService } from '@/features/booking/api/booking.service'
import type { Seat, Technology } from '@/features/halls/model/hall.types'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const useHallEditor = () => {
  const queryClient = useQueryClient()
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [initialSeats, setInitialSeats] = useState<Seat[]>([])
  const [initialTechnologies, setInitialTechnologies] = useState<Technology[]>(
    [],
  )

  const loadHallSeats = async (hallId: string) => {
    setIsLoadingData(true)
    try {
      const hallData = await bookingService.getHallById(hallId)
      setInitialSeats(hallData.seats)
      setInitialTechnologies(hallData.technologies || [])
      return true
    } catch (error) {
      return false
    } finally {
      setIsLoadingData(false)
    }
  }

  const resetEditor = () => {
    setInitialSeats([])
    setInitialTechnologies([])
  }

  const saveMutation = useMutation({
    mutationFn: async ({
      mode,
      hallId,
      hallName,
      data,
    }: {
      mode: 'create' | 'edit'
      hallId: string | null
      hallName: string
      data: any
    }) => {
      let targetHallId = hallId

      if (mode === 'create') {
        const createResult = await hallsService.create(
          hallName,
          data.rows,
          data.cols,
          data.primarySeatTypeId,
          data.technologyIds,
        )
        targetHallId =
          typeof createResult === 'string'
            ? createResult
            : (createResult as any).id || (createResult as any).value
      } else if (mode === 'edit' && hallId) {
        await Promise.all([
          hallsService.update(hallId, hallName),
          hallsService.updateTechnologies(hallId, data.technologyIds),
        ])
      }

      if (!targetHallId) throw new Error('Failed to resolve Hall ID')

      const currentHallState = await bookingService.getHallById(targetHallId)
      const changesByType: Record<string, string[]> = {}

      currentHallState.seats.forEach((seat: Seat) => {
        const targetConfig = data.seatConfig.find(
          (sc: any) => sc.gridX === seat.gridX && sc.gridY === seat.gridY,
        )
        if (targetConfig && targetConfig.seatTypeId !== seat.seatTypeId) {
          const typeId = targetConfig.seatTypeId
          if (!changesByType[typeId]) changesByType[typeId] = []
          changesByType[typeId].push(seat.id)
        }
      })

      const typeIdsToUpdate = Object.keys(changesByType)
      if (typeIdsToUpdate.length > 0) {
        for (const typeId of typeIdsToUpdate) {
          await hallsService.batchChangeSeatType(
            targetHallId!,
            changesByType[typeId],
            typeId,
          )
          if (typeIdsToUpdate.length > 1) await wait(200)
        }
      }

      await wait(500)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] })
    },
  })

  const saveHall = async (
    mode: 'create' | 'edit',
    hallId: string | null,
    hallName: string,
    data: any,
  ) => {
    try {
      await saveMutation.mutateAsync({ mode, hallId, hallName, data })
      return { success: true }
    } catch (error: any) {
      const msg = error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : error.message
      return { success: false, error: msg }
    }
  }

  return {
    initialSeats,
    initialTechnologies,
    isLoadingData,
    isProcessing: saveMutation.isPending,
    loadHallSeats,
    saveHall,
    resetEditor,
  }
}
