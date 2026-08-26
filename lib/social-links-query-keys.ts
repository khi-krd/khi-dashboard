export const socialLinksKeys = {
  all: ["social-links"] as const,
  lists: () => [...socialLinksKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...socialLinksKeys.lists(), { includeInactive }] as const,
}
