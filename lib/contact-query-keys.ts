export type ContactListQueryKeyParts = {
  page: number
  size: number
  activeOnly?: boolean
}

export const contactKeys = {
  all: ["contact"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: ContactListQueryKeyParts) =>
    [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: number) => [...contactKeys.details(), id] as const,
  bySlug: (slug: string) => [...contactKeys.all, "slug", slug] as const,
}
