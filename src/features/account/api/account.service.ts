import { api } from '@/lib/axios'
import type {
  LoyaltyProfileDto,
  SetMyDateOfBirthCommand,
  SetMyDateOfBirthResponse,
  UserProfileDto,
} from '@/features/account/model/account.types'

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
}

export interface ChangePasswordRequest {
  oldPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

export const accountService = {
  getProfile: async (): Promise<UserProfileDto> => {
    const { data } = await api.get<UserProfileDto>('/account/profile')
    return data
  },

  getLoyaltyProfile: async (): Promise<LoyaltyProfileDto> => {
    const { data } = await api.get<LoyaltyProfileDto>('/account/loyalty')
    return data
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    await api.put('/account/profile', data)
  },

  changePassword: async (data: ChangePasswordRequest) => {
    await api.post('/account/change-password', data)
  },

  setMyDateOfBirth: async (
    data: SetMyDateOfBirthCommand,
  ): Promise<SetMyDateOfBirthResponse> => {
    const response = await api.patch<SetMyDateOfBirthResponse>(
      '/users/me/date-of-birth',
      data,
    )
    return response.data
  },
}
