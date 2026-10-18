import { api } from '@/shared/api/axios'
import { type SeatType } from '@/entities/hall/model/hall.types'

let seatTypesCache: SeatType[] | null = null

export const seatTypesService = {
  getAll: async (): Promise<SeatType[]> => {
    if (seatTypesCache) return seatTypesCache

    const { data } = await api.get<SeatType[]>('/seattypes')
    seatTypesCache = data
    return data
  },
}
