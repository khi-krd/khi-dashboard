import type { UserResponse, UserRole } from "@/types/auth"

export type { UserResponse, UserRole }

export type UserRoleFilter = "all" | UserRole
export type UserStatusFilter = "all" | "active" | "inactive"

export type UserListParams = {
  page: number
  size: number
  search?: string
  role?: UserRoleFilter
  status?: UserStatusFilter
}

/** Spring-style paginated page, mirroring the about/news list responses. */
export type UserPage = {
  content: UserResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
