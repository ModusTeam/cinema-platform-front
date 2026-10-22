import { isAxiosError } from 'axios'
import type { hallsService } from '@/entities/hall/api/halls.service'
import { layoutsEqual, serializeSeats } from '@/entities/hall/lib/seatGeometry'
import type { HallLayout } from '@/entities/hall/model/hall.types'
import type { HallBuilderData, HallSaveScope } from '../model/hallBuilder.types'

export interface HallEditorSnapshot {
  id: string
  name: string
  technologyIds: string[]
  layout: HallLayout
}

interface HallSaveInput {
  mode: 'create' | 'edit'
  hallId: string | null
  hallName: string
  data: HallBuilderData
  scope: HallSaveScope
  original: HallEditorSnapshot | null
}

export interface HallSaveResult {
  success: boolean
  error?: string
  layoutLocked?: boolean
  saved: string[]
  snapshot: HallEditorSnapshot | null
}

const describeSaveError = (error: unknown) => {
  const code = isAxiosError<{ code?: string }>(error)
    ? error.response?.data?.code
    : undefined
  if (code === 'Hall.LayoutLocked')
    return {
      layoutLocked: true,
      message:
        'Схему та типи місць не можна змінити: зал має історію сеансів або пов’язані з місцями записи. Назву й технології можна зберегти окремо.',
    }
  if (code === 'Hall.Inactive')
    return {
      message: 'Не можна змінити схему неактивного залу.',
    }
  return {
    message:
      error instanceof Error ? error.message : 'Не вдалося зберегти зал.',
  }
}

// Layout goes first: a locked layout must never silently save metadata.
// A snapshot of successful operations makes partial failures safe to retry.
export const saveHallChanges = async (
  service: Pick<
    typeof hallsService,
    'create' | 'replaceLayout' | 'update' | 'updateTechnologies'
  >,
  input: HallSaveInput,
): Promise<HallSaveResult> => {
  const { mode, hallId, data, scope } = input
  const name = input.hallName.trim()
  let snapshot = input.original
  const saved: string[] = []
  const layout: HallLayout = {
    rows: data.rows,
    seatsPerRow: data.cols,
    seats: serializeSeats(data.seatConfig),
  }
  try {
    if (!name) throw new Error('Вкажіть назву залу.')
    if ((mode === 'create' || scope === 'all') && !layout.seats.length) {
      throw new Error('Додайте хоча б одне місце перед збереженням схеми.')
    }
    if (mode === 'create') {
      await service.create(
        name,
        data.rows,
        data.cols,
        data.primarySeatTypeId,
        data.technologyIds,
        layout.seats,
      )
      return { success: true, saved: ['зал'], snapshot: null }
    }
    if (!hallId || !snapshot || snapshot.id !== hallId)
      throw new Error('Спочатку завантажте зал.')
    if (scope === 'all' && !layoutsEqual(snapshot.layout, layout)) {
      await service.replaceLayout(hallId, layout)
      snapshot = { ...snapshot, layout }
      saved.push('схему місць')
    }
    if (name !== snapshot.name) {
      await service.update(hallId, name)
      snapshot = { ...snapshot, name }
      saved.push('назву')
    }
    const sameTechnologies =
      [...snapshot.technologyIds]
        .sort((a, b) => a.localeCompare(b))
        .join(',') ===
      [...data.technologyIds].sort((a, b) => a.localeCompare(b)).join(',')
    if (!sameTechnologies) {
      await service.updateTechnologies(hallId, data.technologyIds)
      snapshot = { ...snapshot, technologyIds: [...data.technologyIds] }
      saved.push('технології')
    }
    return { success: true, saved, snapshot }
  } catch (error) {
    const description = describeSaveError(error)
    const prefix = saved.length
      ? `Збережено ${saved.join(', ')}. Решту змін не збережено. `
      : ''
    return {
      success: false,
      error: prefix + description.message,
      layoutLocked: description.layoutLocked,
      saved,
      snapshot,
    }
  }
}
