export type DonationListQueryKeyParts = {
  page: number
  size: number
}

export const donationKeys = {
  all: ["donations"] as const,
  settings: () => [...donationKeys.all, "settings"] as const,
  types: () => [...donationKeys.all, "types"] as const,
  archiveLists: () => [...donationKeys.all, "archive", "list"] as const,
  archiveList: (params: DonationListQueryKeyParts) =>
    [...donationKeys.archiveLists(), params] as const,
  financialLists: () => [...donationKeys.all, "financial", "list"] as const,
  financialList: (params: DonationListQueryKeyParts) =>
    [...donationKeys.financialLists(), params] as const,
}
