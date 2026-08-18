import type { VideosListQueryKeyParts } from "@/types/videos-ui"

export const videoKeys = {
  all: ["videos"] as const,
  lists: () => [...videoKeys.all, "list"] as const,
  list: (params: VideosListQueryKeyParts) =>
    [...videoKeys.lists(), params] as const,
  detail: (id: number) => [...videoKeys.all, "detail", id] as const,
  topics: () => [...videoKeys.all, "topics"] as const,
  search: (mode: string, q: string) =>
    [...videoKeys.all, "search", mode, q] as const,
  filmReklamVideo: () => [...videoKeys.all, "film-reklam-video"] as const,
}
