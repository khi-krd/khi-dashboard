"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { navMenuKeys } from "@/lib/nav-menu-query-keys"
import type { NavMenuWritePayload } from "@/lib/nav-menu-form-data"
import {
  createNavMenuItem,
  deleteNavMenuItem,
  getNavMenu,
  getNavMenuItem,
  updateNavMenuItem,
} from "@/services/navMenuService"
import type { NavMenuItemDto } from "@/types/nav-menu"

export function useNavMenuListQuery(includeInactive = true) {
  return useQuery({
    queryKey: navMenuKeys.list(includeInactive),
    queryFn: () => getNavMenu(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useNavMenuItemQuery(id: number) {
  return useQuery({
    queryKey: navMenuKeys.detail(id),
    queryFn: () => getNavMenuItem(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateNavMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NavMenuWritePayload) => createNavMenuItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: navMenuKeys.lists() })
    },
  })
}

export function useUpdateNavMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: NavMenuWritePayload }) =>
      updateNavMenuItem(vars.id, vars.payload),
    onSuccess: (dto, vars) => {
      if (dto) queryClient.setQueryData(navMenuKeys.detail(vars.id), dto)
      void queryClient.invalidateQueries({ queryKey: navMenuKeys.lists() })
    },
  })
}

export function useDeleteNavMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNavMenuItem(id),
    // Drop the row locally first — the list is ten items, so a full refetch
    // round-trip is more visible than the write itself.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: navMenuKeys.lists() })
      const snapshots = queryClient.getQueriesData<NavMenuItemDto[]>({
        queryKey: navMenuKeys.lists(),
      })
      for (const [key, rows] of snapshots) {
        if (!rows) continue
        queryClient.setQueryData(
          key,
          rows.filter((r) => r.id !== id),
        )
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      for (const [key, rows] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, rows)
      }
    },
    onSuccess: (_void, id) => {
      void queryClient.invalidateQueries({ queryKey: navMenuKeys.lists() })
      void queryClient.removeQueries({ queryKey: navMenuKeys.detail(id) })
    },
  })
}
