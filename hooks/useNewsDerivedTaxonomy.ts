"use client"

import { useQuery } from "@tanstack/react-query"

import { newsKeys } from "@/lib/news-query-keys"
import type { CategoryDto, SubCategoryDto } from "@/types/news"

export function useNewsDerivedCategories() {
  return useQuery({
    queryKey: newsKeys.categories(),
    queryFn: async () => [] as CategoryDto[],
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: [],
  })
}

export function useNewsDerivedSubcategories(categoryCkb: string | undefined | null) {
  const key = categoryCkb?.trim() ?? ""

  const q = useQuery({
    queryKey: newsKeys.subcategories(key),
    queryFn: async () => [] as SubCategoryDto[],
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: [],
    enabled: key.length > 0,
  })

  return {
    ...q,
    items: q.data ?? ([] as SubCategoryDto[]),
  }
}
