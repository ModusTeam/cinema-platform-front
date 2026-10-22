import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { hallsService } from '@/entities/hall/api/halls.service'
import { getSeatBounds, serializeSeats } from '@/entities/hall/lib/seatGeometry'
import type { Hall } from '@/entities/hall/model/hall.types'
import {
  type HallEditorSnapshot,
  saveHallChanges,
} from '../lib/saveHallChanges'
import type { HallBuilderData, HallSaveScope } from './hallBuilder.types'

export const useHallEditor = () => {
  const queryClient = useQueryClient()
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [initialHall, setInitialHall] = useState<Hall | null>(null)
  const [layoutLocked, setLayoutLocked] = useState(false)
  const original = useRef<HallEditorSnapshot | null>(null)
  const loadVersion = useRef(0)

  const loadHallSeats = async (hallId: string) => {
    const version = ++loadVersion.current
    setIsLoadingData(true)
    try {
      const hall = await hallsService.getById(hallId)
      if (version !== loadVersion.current) return null
      const bounds = getSeatBounds(hall.seats)
      original.current = {
        id: hall.id,
        name: hall.name,
        technologyIds:
          hall.technologies?.map(technology => technology.id) ?? [],
        layout: {
          rows: Math.max(1, bounds.rows),
          seatsPerRow: Math.max(1, bounds.cols),
          seats: serializeSeats(hall.seats),
        },
      }
      setInitialHall(hall)
      setLayoutLocked(false)
      return true
    } catch {
      return version === loadVersion.current ? false : null
    } finally {
      if (version === loadVersion.current) setIsLoadingData(false)
    }
  }

  const resetEditor = () => {
    ++loadVersion.current
    original.current = null
    setInitialHall(null)
    setLayoutLocked(false)
    setIsLoadingData(false)
  }

  const saveMutation = useMutation({
    mutationFn: async (input: {
      mode: 'create' | 'edit'
      hallId: string | null
      hallName: string
      data: HallBuilderData
      scope: HallSaveScope
    }) => {
      const result = await saveHallChanges(hallsService, {
        ...input,
        original: original.current,
      })
      original.current = result.snapshot
      if (result.layoutLocked) setLayoutLocked(true)
      if (result.saved.length) {
        await Promise.all(
          [
            'admin-halls',
            'halls',
            'session-full-details',
            'admin-sessions',
            'movie-sessions',
          ].map(key => queryClient.invalidateQueries({ queryKey: [key] })),
        )
      }
      return result
    },
  })

  const saveHall = (
    mode: 'create' | 'edit',
    hallId: string | null,
    hallName: string,
    data: HallBuilderData,
    scope: HallSaveScope = 'all',
  ) => saveMutation.mutateAsync({ mode, hallId, hallName, data, scope })

  return {
    initialHall,
    layoutLocked,
    isLoadingData,
    isProcessing: saveMutation.isPending,
    loadHallSeats,
    saveHall,
    resetEditor,
  }
}
