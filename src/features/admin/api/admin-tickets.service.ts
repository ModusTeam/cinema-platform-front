import { api } from '@/shared/api/axios'

export const adminTicketsService = {
  validate: async (id: string): Promise<string> => {
    const { data } = await api.post<string>(`/tickets/${id}/validate`)
    return data
  },
}
