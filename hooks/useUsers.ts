"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { usersKeys } from "@/lib/users-query-keys"
import {
  changeUserRole,
  deleteUser,
  getUsersList,
  setUserActivation,
} from "@/services/usersService"
import type { UserRole } from "@/types/auth"
import type { UserListParams } from "@/types/users"

export function useUsersListQuery(params: UserListParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsersList(params),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  })
}

export function useChangeUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      changeUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

export function useSetUserActivationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActivated }: { id: number; isActivated: boolean }) =>
      setUserActivation(id, isActivated),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}
