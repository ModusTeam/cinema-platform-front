import { api } from '@/shared/api/axios'

export const adminTicketsService = {
  validate: async (id: string): Promise<string> => {
    const response = await api.post(
      `/tickets/${id}/validate`,
      {},
      { responseType: 'text' },
    )
    return response.data
  },
}
