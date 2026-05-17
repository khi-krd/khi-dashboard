import type { CollectionsListQueryKeyParts } from "@/types/image-collections-ui"

export const collectionKeys = {
  all: ["imageCollections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (params: CollectionsListQueryKeyParts) =>
    [...collectionKeys.lists(), params] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: number) => [...collectionKeys.details(), id] as const,
  topics: () => [...collectionKeys.all, "topics"] as const,
}
