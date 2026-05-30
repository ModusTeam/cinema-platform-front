import { api } from '../lib/axios'
import type { Technology } from '@/features/halls/model/hall.types'

export const technologiesService = {
  getAll: async (): Promise<Technology[]> => {
    const { data } = await api.get<Technology[]>('/technologies')
    return data
  },

  create: async (name: string, type: string): Promise<string> => {
    const { data } = await api.post('/technologies', { name, type })
    return data
  },
}
