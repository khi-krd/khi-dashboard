// ─── Auth Request DTOs ──────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  name: string
  username: string
  email: string
  password: string
  pincode?: number
}

export interface PasswordResetTokenRequest {
  email: string
}

export interface PasswordResetRequest {
  email: string
  resetToken: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  username?: string
  name?: string
}

// ─── Auth Response DTOs ───────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  expiresIn: number
}

export type UserRole = "GUEST" | "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN"

export interface UserResponse {
  userId: number
  name: string
  username: string
  email: string
  role: UserRole
  pincode: number | null
  isActivated: boolean
  profileImage: string | null
  imageUrl: string | null
  provider: string
  createdAt: string
  updatedAt: string
  passwordExpiryDate: string | null
}

// ─── Error shapes ────────────────────────────────────────────────────────────

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiValidationError {
  timestamp: string
  status: 400
  errors: ApiFieldError[]
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
}
