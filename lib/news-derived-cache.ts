import type { QueryClient } from "@tanstack/react-query"

import { newsKeys } from "@/lib/news-query-keys"
import type { CategoryDto, NewsDto, SubCategoryDto } from "@/types/news"

function uniqCategories(rows: Iterable<NewsDto>): CategoryDto[] {
  const map = new Map<string, CategoryDto>()
  for (const n of rows) {
    const c = n.category
    if (!c?.ckbName?.trim()) continue
    const key = c.ckbName.trim()
    map.set(key, {
      ckbName: key,
      kmrName: c.kmrName?.trim() ?? "",
    })
  }
  return [...map.values()].sort((a, b) => a.ckbName.localeCompare(b.ckbName, "ckb"))
}

function subsFor(rows: Iterable<NewsDto>, categoryCkb: string): SubCategoryDto[] {
  const map = new Map<string, SubCategoryDto>()
  const cat = categoryCkb.trim()
  for (const n of rows) {
    if ((n.category?.ckbName?.trim() ?? "") !== cat) continue
    const sc = n.subCategory
    if (!sc?.ckbName?.trim()) continue
    map.set(sc.ckbName.trim(), {
      ckbName: sc.ckbName.trim(),
      kmrName: sc.kmrName?.trim() ?? "",
    })
  }
  return [...map.values()].sort((a, b) => a.ckbName.localeCompare(b.ckbName, "ckb"))
}

/** Merge unique categories/subcategories observed in the latest page payload into TanStack Query. */
export function mergeNewsDerivedTaxonomy(
  queryClient: QueryClient,
  rows: NewsDto[],
): void {
  const pageCats = uniqCategories(rows)
  if (pageCats.length) {
    queryClient.setQueryData(newsKeys.categories(), (prev: CategoryDto[] | undefined) => {
      const map = new Map<string, CategoryDto>()
      for (const c of prev ?? []) {
        if (c.ckbName?.trim())
          map.set(c.ckbName.trim(), {
            ckbName: c.ckbName.trim(),
            kmrName: c.kmrName?.trim() ?? "",
          })
      }
      for (const c of pageCats) map.set(c.ckbName, c)
      return [...map.values()].sort((a, b) =>
        a.ckbName.localeCompare(b.ckbName, "ckb"),
      )
    })
  }

  const catKeys = new Set<string>()
  for (const c of queryClient.getQueryData<CategoryDto[]>(newsKeys.categories()) ??
    []) {
    if (c.ckbName?.trim()) catKeys.add(c.ckbName.trim())
  }
  for (const n of rows) {
    if (n.category?.ckbName?.trim())
      catKeys.add(n.category.ckbName.trim())
  }

  for (const catCkb of catKeys) {
    const pageSubs = subsFor(rows, catCkb)
    if (!pageSubs.length) continue
    queryClient.setQueryData(
      newsKeys.subcategories(catCkb),
      (prev: SubCategoryDto[] | undefined) => {
        const map = new Map<string, SubCategoryDto>()
        for (const s of prev ?? []) {
          if (s.ckbName?.trim())
            map.set(s.ckbName.trim(), {
              ckbName: s.ckbName.trim(),
              kmrName: s.kmrName?.trim() ?? "",
            })
        }
        for (const s of pageSubs) map.set(s.ckbName, s)
        return [...map.values()].sort((a, b) =>
          a.ckbName.localeCompare(b.ckbName, "ckb"),
        )
      },
    )
  }
}

/** Push a freshly created pair into the taxonomy cache without waiting for another list fetch. */
export function pushInlineCategory(queryClient: QueryClient, dto: CategoryDto): void {
  const ckb = dto.ckbName.trim()
  if (!ckb) return
  const next: CategoryDto = { ckbName: ckb, kmrName: dto.kmrName.trim() }
  queryClient.setQueryData(newsKeys.categories(), (prev: CategoryDto[] | undefined) => {
    const map = new Map<string, CategoryDto>()
    for (const c of prev ?? []) {
      if (c.ckbName?.trim())
        map.set(c.ckbName.trim(), {
          ckbName: c.ckbName.trim(),
          kmrName: c.kmrName?.trim() ?? "",
        })
    }
    map.set(ckb, next)
    return [...map.values()].sort((a, b) =>
      a.ckbName.localeCompare(b.ckbName, "ckb"),
    )
  })
}

export function pushInlineSubcategory(
  queryClient: QueryClient,
  categoryCkb: string,
  dto: SubCategoryDto,
): void {
  const cat = categoryCkb.trim()
  const key = dto.ckbName.trim()
  if (!cat || !key) return
  const next = {
    ckbName: key,
    kmrName: dto.kmrName.trim(),
  }
  queryClient.setQueryData(
    newsKeys.subcategories(cat),
    (prev: SubCategoryDto[] | undefined) => {
      const map = new Map<string, SubCategoryDto>()
      for (const s of prev ?? []) {
        if (s.ckbName?.trim())
          map.set(s.ckbName.trim(), {
            ckbName: s.ckbName.trim(),
            kmrName: s.kmrName?.trim() ?? "",
          })
      }
      map.set(key, next)
      return [...map.values()].sort((a, b) =>
        a.ckbName.localeCompare(b.ckbName, "ckb"),
      )
    },
  )
}
