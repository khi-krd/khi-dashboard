export const navMenuKeys = {
  all: ["nav-menu"] as const,
  lists: () => [...navMenuKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...navMenuKeys.lists(), { includeInactive }] as const,
}
