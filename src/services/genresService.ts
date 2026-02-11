import { api } from '../lib/axios'

export interface Genre {
  id: string
  externalId: number | null
  name: string
}

export const genresService = {
  getAll: async (): Promise<Genre[]> => {
    const { data } = await api.get<Genre[]>('/genres')
    return data
  },

  create: async (externalId: number | null, name: string): Promise<string> => {
    const { data } = await api.post('/genres', { externalId, name })
    return data
  },

  update: async (externalId: number, name: string): Promise<void> => {
    await api.put(`/genres/${externalId}`, { name })
  },

  delete: async (externalId: number): Promise<void> => {
    await api.delete(`/genres/${externalId}`)
  },
}
