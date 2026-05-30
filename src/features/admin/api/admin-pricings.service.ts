import { api } from '../lib/axios'

export interface PricingItemDto {
  id: string
  dayOfWeek: number
  seatTypeId: string
  seatTypeName: string
  price: number
}

export interface PricingDetailsDto {
  id: string
  name: string
  items: PricingItemDto[]
}

export interface CreatePricingRequest {
  name: string
}

export interface SetPricingRuleDto {
  dayOfWeek: number
  seatTypeId: string
  price: number
}

export interface PricingLookup {
  id: string
  name: string
}

export const adminPricingsService = {
  getAll: async (): Promise<PricingDetailsDto[]> => {
    const { data } = await api.get<PricingDetailsDto[]>('/pricings')
    return data
  },

  getById: async (id: string): Promise<PricingDetailsDto> => {
    const { data } = await api.get<PricingDetailsDto>(`/pricings/${id}`)
    return data
  },

  create: async (name: string): Promise<string> => {
    const { data } = await api.post<string>('/pricings', { name })
    return data
  },

  setRules: async (
    pricingId: string,
    rules: SetPricingRuleDto[],
  ): Promise<void> => {
    await api.post(`/pricings/${pricingId}/rules`, rules)
  },

  getLookups: async (): Promise<PricingLookup[]> => {
    const { data } = await api.get<PricingDetailsDto[]>('/pricings')
    return data.map(p => ({ id: p.id, name: p.name }))
  },
}
