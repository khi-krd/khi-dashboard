import type { SoundsListQueryKeyParts } from "@/types/sounds-ui"

export const soundKeys = {
  all: ["sounds"] as const,
  lists: () => [...soundKeys.all, "list"] as const,
  list: (params: SoundsListQueryKeyParts) =>
    [...soundKeys.lists(), params] as const,
  detail: (id: number) => [...soundKeys.all, "detail", id] as const,
  topics: () => [...soundKeys.all, "topics"] as const,
  search: (q: string) => [...soundKeys.all, "search", q] as const,
  types: () => [...soundKeys.all, "types"] as const,
}
