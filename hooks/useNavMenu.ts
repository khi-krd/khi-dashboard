"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { navMenuKeys } from "@/lib/nav-menu-query-keys"
import type { NavMenuImageWritePayload } from "@/lib/nav-menu-form-data"
import {
  getNavMenu,
  updateNavMenuItem,
} from "@/services/navMenuService"

export function useNavMenuListQuery(includeInactive = true) {
  return useQuery({
    queryKey: navMenuKeys.list(includeInactive),
    queryFn: () => getNavMenu(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateNavMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: NavMenuImageWritePayload }) =>
      updateNavMenuItem(vars.id, vars.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: navMenuKeys.lists() })
    },
  })
}
