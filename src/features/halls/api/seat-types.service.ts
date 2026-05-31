import { api } from '@/lib/axios'
import { type SeatType } from '@/features/halls/model/hall.types'

let seatTypesCache: SeatType[] | null = null

export const seatTypesService = {
  getAll: async (): Promise<SeatType[]> => {
    if (seatTypesCache) return seatTypesCache

    const { data } = await api.get<SeatType[]>('/seattypes')
    seatTypesCache = data
    return data
  },
}
