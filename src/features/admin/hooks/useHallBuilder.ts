import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { technologiesService } from '@/features/halls/api/technologies.service'
import { seatTypesService } from '@/features/halls/api/seat-types.service'
import type { Seat, SeatType } from '@/features/halls/model/hall.types'

export const useHallBuilder = (
  initialSeats: Seat[] = [],
  initialRows = 5,
  initialCols = 8,
  initialTechIds: string[] = [],
) => {
  const [rows, setRows] = useState(initialRows)
  const [cols, setCols] = useState(initialCols)
  const [selectedPaintType, setSelectedPaintType] = useState<SeatType | null>(
    null,
  )
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const [gridConfig, setGridConfig] = useState<Map<string, string>>(new Map())

  const seatTypesQuery = useQuery({
    queryKey: ['seat-types'],
    queryFn: seatTypesService.getAll,
    staleTime: Infinity,
  })

  const technologiesQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: technologiesService.getAll,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (seatTypesQuery.data && !selectedPaintType) {
      const standard = seatTypesQuery.data.find(t =>
        t.name.toLowerCase().includes('standard'),
      )
      setSelectedPaintType(standard || seatTypesQuery.data[0])
    }
  }, [seatTypesQuery.data, selectedPaintType])

  useEffect(() => {
    if (initialTechIds.length > 0) setSelectedTechIds(initialTechIds)
  }, [initialTechIds])

  useEffect(() => {
    if (initialSeats.length > 0) {
      const minX = Math.min(...initialSeats.map(s => s.gridX))
      const minY = Math.min(...initialSeats.map(s => s.gridY))
      const shiftX = minX > 0 ? minX : 0
      const shiftY = minY > 0 ? minY : 0
      let maxNormalizedX = 0
      let maxNormalizedY = 0
      const newMap = new Map<string, string>()

      initialSeats.forEach(s => {
        const normX = s.gridX - shiftX
        const normY = s.gridY - shiftY
        if (normX > maxNormalizedX) maxNormalizedX = normX
        if (normY > maxNormalizedY) maxNormalizedY = normY
        newMap.set(`${normX}-${normY}`, s.seatTypeId)
      })

      setCols(maxNormalizedX + 1)
      setRows(maxNormalizedY + 1)
      setGridConfig(newMap)
    }
  }, [initialSeats])

  const toggleTech = (id: string) => {
    setSelectedTechIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    )
  }

  const handleCellClick = (x: number, y: number) => {
    if (!selectedPaintType) return
    const key = `${x}-${y}`
    setGridConfig(prev => {
      const newMap = new Map(prev)
      if (newMap.get(key) === selectedPaintType.id) {
        newMap.delete(key)
      } else {
        newMap.set(key, selectedPaintType.id)
      }
      return newMap
    })
  }

  return {
    rows,
    setRows,
    cols,
    setCols,
    availableSeatTypes: seatTypesQuery.data || [],
    availableTechnologies: technologiesQuery.data || [],
    selectedPaintType,
    setSelectedPaintType,
    selectedTechIds,
    toggleTech,
    gridConfig,
    handleCellClick,
    isLoading: seatTypesQuery.isLoading || technologiesQuery.isLoading,
  }
}
