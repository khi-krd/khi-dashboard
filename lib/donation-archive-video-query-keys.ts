export const donationArchiveVideoKeys = {
  all: ["donation-archive-videos"] as const,
  lists: () => [...donationArchiveVideoKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...donationArchiveVideoKeys.lists(), { includeInactive }] as const,
}
