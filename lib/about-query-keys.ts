export type AboutListQueryKeyParts = {
  page: number
  size: number
}

export const aboutKeys = {
  all: ["about"] as const,
  lists: () => [...aboutKeys.all, "list"] as const,
  list: (params: AboutListQueryKeyParts) =>
    [...aboutKeys.lists(), params] as const,
  details: () => [...aboutKeys.all, "detail"] as const,
  detail: (id: number) => [...aboutKeys.details(), id] as const,
  team: () => [...aboutKeys.all, "team"] as const,
  partners: () => [...aboutKeys.all, "partners"] as const,
}
