export const donationTypeCardKeys = {
  all: ["donation-type-cards"] as const,
  lists: () => [...donationTypeCardKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...donationTypeCardKeys.lists(), { includeInactive }] as const,
}
