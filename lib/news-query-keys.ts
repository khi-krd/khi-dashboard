import type { NewsListQueryKeyParts } from "@/types/news-ui"

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (params: NewsListQueryKeyParts) => [...newsKeys.lists(), params] as const,
  detail: (id: number) => [...newsKeys.all, "detail", id] as const,
  categories: () => [...newsKeys.all, "categories", "derived"] as const,
  subcategories: (categoryCkb: string) =>
    [...newsKeys.all, "subcategories", categoryCkb] as const,
}
