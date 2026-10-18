"use client"

import { useQuery } from "@tanstack/react-query"

import { newsKeys } from "@/lib/news-query-keys"
import { getNewsTaxonomy } from "@/services/taxonomyService"
import type { CategoryDto, SubCategoryDto } from "@/types/news"

/**
 * Category options for the news form picker — sourced from the managed
 * taxonomy endpoint (/api/v1/news/categories). The cache key is shared with
 * `mergeNewsDerivedTaxonomy` / `pushInlineCategory`, which union names seen
 * on loaded news rows or typed inline into the same list.
 */
export function useNewsDerivedCategories() {
  return useQuery({
    queryKey: newsKeys.categories(),
    queryFn: async (): Promise<CategoryDto[]> => {
      const cats = await getNewsTaxonomy()
      return cats.map((c) => ({ ckbName: c.nameCkb, kmrName: c.nameKmr }))
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Sub-category options under the picked category — sliced out of the same
 * managed taxonomy response, keyed by the category's CKB name.
 */
export function useNewsDerivedSubcategories(
  categoryCkb: string | undefined | null,
) {
  const key = categoryCkb?.trim() ?? ""

  const q = useQuery({
    queryKey: newsKeys.subcategories(key),
    queryFn: async (): Promise<SubCategoryDto[]> => {
      const cats = await getNewsTaxonomy()
      const cat = cats.find((c) => c.nameCkb === key)
      return (cat?.subCategories ?? []).map((s) => ({
        ckbName: s.nameCkb,
        kmrName: s.nameKmr,
      }))
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: key.length > 0,
  })

  return {
    ...q,
    items: q.data ?? ([] as SubCategoryDto[]),
  }
}
