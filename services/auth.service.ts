import api from "@/lib/axios"
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetRequest,
  PasswordResetTokenRequest,
  UpdateProfileRequest,
  UserResponse,
} from "@/types/auth"

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload)
  return data
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout")
}

export async function logoutAll(): Promise<void> {
  await api.post("/api/auth/logout-all")
}

export async function requestPasswordResetToken(
  payload: PasswordResetTokenRequest,
): Promise<string> {
  const { data } = await api.post<string>(
    `/api/auth/reset-token?email=${encodeURIComponent(payload.email)}`,
  )
  return data
}

export async function resetPassword(
  payload: PasswordResetRequest,
): Promise<string> {
  const { data } = await api.post<string>(
    "/api/auth/reset-password",
    payload,
  )
  return data
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/api/user/me")
  return data
}

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>("/api/user/profile", payload)
  return data
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    "/api/user/password",
    payload,
  )
  return data
}

export async function uploadProfileImage(file: File): Promise<UserResponse> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await api.post<UserResponse>(
    "/api/user/profile-image",
    form,
    {
      headers: {
        "Content-Type": undefined,
      },
    },
  )
  return data
}

export async function deleteProfileImage(): Promise<UserResponse> {
  const { data } = await api.delete<UserResponse>("/api/user/profile-image")
  return data
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/api/user/account")
}
