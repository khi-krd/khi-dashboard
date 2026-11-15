"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  getPopularIds,
  setPopular,
  type PopularEntity,
  type PopularIdsResponse,
} from "@/services/popularService"

export const POPULAR_IDS_KEY = ["popular-ids"] as const

const EMPTY: PopularIdsResponse = {
  news: [],
  projects: [],
  videos: [],
  sounds: [],
  writings: [],
  collections: [],
}

/** Shared popular-id sets — one query feeds every row's switch. */
export function usePopularIds() {
  return useQuery({
    queryKey: POPULAR_IDS_KEY,
    queryFn: getPopularIds,
    staleTime: 30_000,
  })
}

export function isPopularId(
  data: PopularIdsResponse | undefined,
  entity: PopularEntity,
  id: number,
): boolean {
  return data?.[entity]?.includes(id) ?? false
}

export function usePopularToggle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      entity,
      id,
      isPopular,
    }: {
      entity: PopularEntity
      id: number
      isPopular: boolean
    }) => setPopular(entity, id, isPopular),
    onSuccess: (_data, vars) => {
      queryClient.setQueryData<PopularIdsResponse>(POPULAR_IDS_KEY, (old) => {
        const base = old ?? EMPTY
        const list = base[vars.entity] ?? []
        const next = vars.isPopular
          ? Array.from(new Set([...list, vars.id]))
          : list.filter((x) => x !== vars.id)
        return { ...base, [vars.entity]: next }
      })
      toast.success(vars.isPopular ? "باو کرایەوە" : "لە باوکرانەوە لابرا")
    },
    onError: () => {
      toast.error("هەڵە لە نوێکردنەوەی دۆخ")
      void queryClient.invalidateQueries({ queryKey: POPULAR_IDS_KEY })
    },
  })
}
