import { api } from '@/lib/axios'
import { adminPricingsService, type PricingLookup } from '@/services/adminPricingsService'
import type { PaginatedResult } from '@/types/common'

export interface SessionDto {
  id: string
  startTime: string
  endTime: string
  status: string
  movieId: string
  movieTitle: string
  hallId: string
  hallName: string
  pricingId: string
  pricingName: string
}

export interface CreateSessionRequest {
  movieId: string
  hallId: string
  pricingId: string
  startTime: string
}

export const adminSessionsService = {
  getAll: async (page = 1, pageSize = 100): Promise<SessionDto[]> => {
    const { data } = await api.get<PaginatedResult<SessionDto>>('/sessions', {
      params: { pageNumber: page, pageSize },
    })
    return data.items
  },

  create: async (payload: CreateSessionRequest) => {
    const { data } = await api.post('/sessions', payload)
    return data
  },

  reschedule: async (id: string, newStartTime: string) => {
    await api.put(`/sessions/${id}/reschedule`, {
      sessionId: id,
      newStartTime,
    })
  },

  cancel: async (id: string) => {
    await api.delete(`/sessions/${id}`)
  },

  getPricingsLookup: async (): Promise<PricingLookup[]> => {
    return adminPricingsService.getLookups()
  },
}
