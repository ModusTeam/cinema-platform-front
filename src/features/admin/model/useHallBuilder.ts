import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { seatTypesService } from '@/entities/hall/api/seat-types.service'
import { technologiesService } from '@/entities/hall/api/technologies.service'
import {
  createRectangularSeats,
  createSeatLookup,
  getSeatBounds,
} from '@/entities/hall/lib/seatGeometry'
import type { HallSeatDefinition, Seat } from '@/entities/hall/model/hall.types'
import { HALL_EDITOR_LIMITS } from '../config/hallEditor.config'
import {
  type HallPaintTool,
  paintHallSeat,
  seatsOutsideBounds,
} from '../lib/hallPainting'

export const useHallBuilder = (
  initialSeats: Seat[] = [],
  initialRows = 5,
  initialCols = 8,
  initialTechIds: string[] = [],
  isEditing = false,
) => {
  const initialBounds = getSeatBounds(initialSeats)
  const maxRows = Math.max(HALL_EDITOR_LIMITS.rows, initialBounds.rows)
  const maxCols = Math.max(HALL_EDITOR_LIMITS.cols, initialBounds.cols)
  const [rows, setRows] = useState(() =>
    isEditing ? Math.max(1, initialBounds.rows) : initialRows,
  )
  const [cols, setCols] = useState(() =>
    isEditing ? Math.max(1, initialBounds.cols) : initialCols,
  )
  const [paintTypeId, setPaintTypeId] = useState<string | null>(null)
  const [tool, setTool] = useState<HallPaintTool>('paint')
  const [selectedTechIds, setSelectedTechIds] = useState(initialTechIds)
  const [gridConfig, setGridConfig] = useState<Map<
    string,
    HallSeatDefinition
  > | null>(() => (isEditing ? createSeatLookup(initialSeats) : null))
  const [pendingResize, setPendingResize] = useState<{
    rows: number
    cols: number
  } | null>(null)

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
  const availableSeatTypes = seatTypesQuery.data ?? []
  const primaryType =
    availableSeatTypes.find(type =>
      type.name.toLowerCase().includes('standard'),
    ) ?? availableSeatTypes[0]
  const selectedPaintType =
    availableSeatTypes.find(type => type.id === paintTypeId) ?? primaryType

  useEffect(() => {
    if (gridConfig === null && primaryType) {
      setGridConfig(
        createSeatLookup(createRectangularSeats(rows, cols, primaryType.id)),
      )
    }
  }, [gridConfig, primaryType, rows, cols])

  const applyResize = (nextRows: number, nextCols: number) => {
    setGridConfig(
      previous =>
        previous &&
        createSeatLookup(
          Array.from(previous.values()).filter(
            seat => seat.gridX <= nextCols && seat.gridY <= nextRows,
          ),
        ),
    )
    setRows(nextRows)
    setCols(nextCols)
    setPendingResize(null)
  }

  const requestResize = (nextRows: number, nextCols: number) => {
    // Keep normal editing manageable while preserving larger persisted bounds.
    if (
      !Number.isInteger(nextRows) ||
      !Number.isInteger(nextCols) ||
      nextRows < 1 ||
      nextCols < 1 ||
      nextRows > maxRows ||
      nextCols > maxCols
    )
      return
    if (
      seatsOutsideBounds(gridConfig?.values() ?? [], nextRows, nextCols).length
    ) {
      setPendingResize({ rows: nextRows, cols: nextCols })
    } else {
      applyResize(nextRows, nextCols)
    }
  }

  const toggleTech = (id: string) => {
    setSelectedTechIds(previous =>
      previous.includes(id)
        ? previous.filter(technologyId => technologyId !== id)
        : [...previous, id],
    )
  }

  const handleCellClick = (gridX: number, gridY: number) => {
    setGridConfig(
      previous =>
        previous &&
        paintHallSeat(previous, gridX, gridY, selectedPaintType?.id, tool),
    )
  }

  return {
    rows,
    cols,
    maxRows,
    maxCols,
    requestResize,
    pendingResize,
    setPendingResize,
    applyResize,
    availableSeatTypes,
    availableTechnologies: technologiesQuery.data ?? [],
    primaryType,
    selectedPaintType,
    selectPaintType: (id: string) => {
      setPaintTypeId(id)
      setTool('paint')
    },
    tool,
    setTool,
    selectedTechIds,
    toggleTech,
    gridConfig,
    handleCellClick,
    isLoading: seatTypesQuery.isPending || technologiesQuery.isPending,
    isError: seatTypesQuery.isError || technologiesQuery.isError,
    retry: () => {
      void seatTypesQuery.refetch()
      void technologiesQuery.refetch()
    },
  }
}
