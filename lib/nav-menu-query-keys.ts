export const navMenuKeys = {
  all: ["nav-menu"] as const,
  lists: () => [...navMenuKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...navMenuKeys.lists(), { includeInactive }] as const,
  details: () => [...navMenuKeys.all, "detail"] as const,
  detail: (id: number) => [...navMenuKeys.details(), id] as const,
}
