import api from "@/lib/axios"
import type { UserRole } from "@/types/auth"

const BASE = "/api/users"

export type DashboardUser = {
  userId: number
  name?: string | null
  username?: string | null
  email?: string | null
  role?: UserRole | null
  pincode?: number | null
  isActivated?: boolean | null
  profileImage?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type UsersPage = {
  content: DashboardUser[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  empty: boolean
}

export type UserListParams = {
  keyword?: string
  role?: UserRole
  page?: number
  size?: number
}

export async function getUsers(params: UserListParams): Promise<UsersPage> {
  const { data } = await api.get<UsersPage>(BASE, { params })
  return data
}

export type UserWritePayload = {
  name?: string
  username: string
  email?: string
  password?: string
  pincode?: number | null
  role?: UserRole
  isActivated?: boolean
}

export async function createUser(payload: UserWritePayload): Promise<DashboardUser> {
  const { data } = await api.post<DashboardUser>(BASE, payload)
  return data
}

export async function updateUser(
  id: number,
  payload: Partial<UserWritePayload>,
): Promise<DashboardUser> {
  const { data } = await api.put<DashboardUser>(`${BASE}/${id}`, payload)
  return data
}

export async function changeUserRole(
  id: number,
  role: UserRole,
): Promise<DashboardUser> {
  const { data } = await api.patch<DashboardUser>(`${BASE}/${id}/role`, { role })
  return data
}

export async function setUserActivated(
  id: number,
  isActivated: boolean,
): Promise<DashboardUser> {
  const { data } = await api.patch<DashboardUser>(`${BASE}/${id}/status`, {
    isActivated,
  })
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
