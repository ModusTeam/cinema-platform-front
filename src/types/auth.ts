export interface User {
  id: string
  email: string
  name: string
  surname: string
  role: string
  dateOfBirth?: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}
