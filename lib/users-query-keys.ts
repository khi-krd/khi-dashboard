import type { UserListParams } from "@/types/users"

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: UserListParams) => [...usersKeys.lists(), params] as const,
}
