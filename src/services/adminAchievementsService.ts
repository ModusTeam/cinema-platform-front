import { api } from '@/lib/axios'

export interface AdminAchievementDto {
  id: string
  code: string
  name: string
  description: string
  secretHint?: string
  isSecret: boolean
  icon: string
  category: number | string
  rarity: number | string
  strategy: number | string
  criteriaJson: string
  rewardPoints: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminAchievementsResponse {
  achievements: AdminAchievementDto[]
  total: number
}

export interface AdminAchievementPayload {
  code: string
  name: string
  description: string
  secretHint: string
  isSecret: boolean
  icon: string
  category: number
  rarity: number
  strategy: number
  criteriaJson: string
  rewardPoints: number
  sortOrder: number
  isActive: boolean
}

export interface AdminAchievementUpdatePayload extends AdminAchievementPayload {
  id: string
}

export const adminAchievementsService = {
  getAll: async (
    includeInactive: boolean,
    limit = 50,
    offset = 0,
  ): Promise<AdminAchievementsResponse> => {
    const { data } = await api.get<AdminAchievementsResponse>('/achievements', {
      params: { includeInactive, limit, offset },
    })

    return data
  },

  create: async (
    payload: AdminAchievementPayload,
  ): Promise<AdminAchievementDto> => {
    const { data } = await api.post<AdminAchievementDto>(
      '/achievements',
      payload,
    )
    return data
  },

  update: async (
    id: string,
    payload: AdminAchievementPayload,
  ): Promise<AdminAchievementDto> => {
    const body: AdminAchievementUpdatePayload = {
      ...payload,
      id,
    }

    const { data } = await api.put<AdminAchievementDto>(
      `/achievements/${id}`,
      body,
    )
    return data
  },

  delete: async (id: string): Promise<AdminAchievementDto> => {
    const { data } = await api.delete<AdminAchievementDto>(
      `/achievements/${id}`,
    )
    return data
  },
}
