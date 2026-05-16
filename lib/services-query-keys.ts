import type { ServicesListQueryKeyParts } from "@/types/services-ui"

export const servicesKeys = {
  all: ["services"] as const,
  lists: () => [...servicesKeys.all, "list"] as const,
  list: (params: ServicesListQueryKeyParts) =>
    [...servicesKeys.lists(), params] as const,
  detail: (id: number) => [...servicesKeys.all, "detail", id] as const,
  types: () => [...servicesKeys.all, "types"] as const,
}
