"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getMe } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import type { UserResponse } from "@/types/auth"

export const userKeys = {
  me: ["user", "me"] as const,
}

/**
 * Loads the authenticated user via `GET /api/user/me` and mirrors it into the
 * Zustand store (the store doesn't persist the user object, so this also
 * repopulates the sidebar after a page refresh). Disabled when logged out.
 */
export function useCurrentUserQuery() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const user = await getMe()
      useAuthStore.getState().setUser(user)
      return user
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  })
}

/** Push an updated user into both the query cache and the auth store. */
export function syncCurrentUser(
  queryClient: ReturnType<typeof useQueryClient>,
  user: UserResponse,
): void {
  queryClient.setQueryData(userKeys.me, user)
  useAuthStore.getState().setUser(user)
}
