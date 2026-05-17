import type { WritingsListQueryKeyParts, WritingsSearchMode } from "@/types/writings-ui"

export const writingsKeys = {
  all: ["writings"] as const,
  lists: () => [...writingsKeys.all, "list"] as const,
  list: (params: WritingsListQueryKeyParts) =>
    [...writingsKeys.lists(), params] as const,
  detail: (id: number) => [...writingsKeys.all, "detail", id] as const,
  topics: () => [...writingsKeys.all, "topics"] as const,
  seriesParents: () => [...writingsKeys.all, "series", "parents"] as const,
  series: (seriesId: string) =>
    [...writingsKeys.all, "series", seriesId] as const,
  search: (mode: WritingsSearchMode, q: string) =>
    [...writingsKeys.all, "search", mode, q] as const,
}
