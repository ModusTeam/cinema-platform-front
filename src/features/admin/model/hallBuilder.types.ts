import type { HallSeatDefinition } from '@/entities/hall/model/hall.types'

export type HallSaveScope = 'all' | 'metadata'

export interface HallBuilderData {
  rows: number
  cols: number
  technologyIds: string[]
  primarySeatTypeId: string
  seatConfig: HallSeatDefinition[]
}
