import { api } from '../lib/axios'

export interface Genre {
  id: string
  externalId: number | null
  name: string
}

export const genresService = {
  getAll: async (): Promise<Genre[]> => {
    const { data } = await api.get<Genre[]>(`/genres?t=${new Date().getTime()}`)
    return data
  },

  create: async (externalId: number | null, name: string): Promise<string> => {
    const { data } = await api.post('/genres', { externalId, name })
    return data
  },

  update: async (id: string, name: string): Promise<void> => {
    await api.put(`/genres/${id}`, { name })
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/genres/${id}`)
  },
}
