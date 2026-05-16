import type { ProjectsListQueryKeyParts } from "@/types/projects-ui"

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: ProjectsListQueryKeyParts) =>
    [...projectKeys.lists(), params] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
  types: () => [...projectKeys.all, "types", "derived"] as const,
}
