import { MOCK_USERS } from "@/lib/mock-users"
import type { UserResponse, UserRole } from "@/types/auth"
import type { UserListParams, UserPage } from "@/types/users"

/**
 * MOCKUP service. The KHI backend reference documents no admin user-management
 * endpoints, so this works against an in-memory store. When the real API ships,
 * swap each function body for an `api.*` call to these endpoints:
 *
 *   GET    /api/admin/users?page=&size=&search=&role=&status=   → UserPage
 *   PUT    /api/admin/users/{id}     { role?, isActivated? }     → UserResponse
 *   DELETE /api/admin/users/{id}                                 → 204
 */
export const USERS_ENDPOINT = "/api/admin/users" // TODO(backend): not implemented yet

let store: UserResponse[] = [...MOCK_USERS]

function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function matchesSearch(user: UserResponse, search?: string): boolean {
  const kw = search?.trim().toLowerCase()
  if (!kw) return true
  return (
    user.name.toLowerCase().includes(kw) ||
    user.username.toLowerCase().includes(kw) ||
    user.email.toLowerCase().includes(kw)
  )
}

export async function getUsersList(params: UserListParams): Promise<UserPage> {
  await delay()
  const { page, size, search, role = "all", status = "all" } = params

  const filtered = store.filter((user) => {
    if (!matchesSearch(user, search)) return false
    if (role !== "all" && user.role !== role) return false
    if (status === "active" && !user.isActivated) return false
    if (status === "inactive" && user.isActivated) return false
    return true
  })

  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const start = page * size
  const content = filtered.slice(start, start + size)

  return { content, totalElements, totalPages, number: page, size }
}

export async function updateUser(
  id: number,
  patch: Partial<Pick<UserResponse, "role" | "isActivated">>,
): Promise<UserResponse> {
  await delay(280)
  store = store.map((user) =>
    user.userId === id
      ? { ...user, ...patch, updatedAt: new Date().toISOString() }
      : user,
  )
  const updated = store.find((user) => user.userId === id)
  if (!updated) throw new Error("User not found")
  return updated
}

export function changeUserRole(id: number, role: UserRole): Promise<UserResponse> {
  return updateUser(id, { role })
}

export function setUserActivation(
  id: number,
  isActivated: boolean,
): Promise<UserResponse> {
  return updateUser(id, { isActivated })
}

export async function deleteUser(id: number): Promise<void> {
  await delay(280)
  store = store.filter((user) => user.userId !== id)
}
