import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { hallsService } from '@/entities/hall/api/halls.service'
import type { Seat, Technology } from '@/entities/hall/model/hall.types'
import type { HallBuilderData } from './hallBuilder.types'

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
      const hallData = await hallsService.getById(hallId)
      setInitialSeats(hallData.seats)
      setInitialTechnologies(hallData.technologies || [])
      return true
    } catch {
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
      data: HallBuilderData
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
            : createResult.id || createResult.value || null
      } else if (mode === 'edit' && hallId) {
        await Promise.all([
          hallsService.update(hallId, hallName),
          hallsService.updateTechnologies(hallId, data.technologyIds),
        ])
      }

      if (!targetHallId) throw new Error('Failed to resolve Hall ID')

      const currentHallState = await hallsService.getById(targetHallId)
      const changesByType: Record<string, string[]> = {}

      currentHallState.seats.forEach((seat: Seat) => {
        const targetConfig = data.seatConfig.find(
          sc => sc.gridX === seat.gridX && sc.gridY === seat.gridY,
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
            targetHallId,
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
    data: HallBuilderData,
  ) => {
    try {
      await saveMutation.mutateAsync({ mode, hallId, hallName, data })
      return { success: true }
    } catch (error) {
      const errors = isAxiosError<{ errors?: unknown }>(error)
        ? error.response?.data?.errors
        : undefined
      const msg = errors
        ? JSON.stringify(errors)
        : error instanceof Error
          ? error.message
          : undefined
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
