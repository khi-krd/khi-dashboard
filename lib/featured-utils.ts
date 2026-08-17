export type FeaturedItem = {
  id?: number
  featured?: boolean
  featuredOrder?: number | null
}

export function pickFeatured<T extends FeaturedItem>(items: T[]): T[] {
  return items
    .filter((item) => item.featured && item.id != null)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
}

export function nextFeaturedOrder<T extends FeaturedItem>(items: T[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((item) => item.featuredOrder ?? 0)) + 1
}

export function reorderFeaturedIds(
  ids: number[],
  activeId: number,
  overId: number,
): number[] {
  const oldIndex = ids.indexOf(activeId)
  const newIndex = ids.indexOf(overId)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return ids
  const next = [...ids]
  const [moved] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, moved!)
  return next
}

export function reorderFeaturedKeys(
  keys: string[],
  activeKey: string,
  overKey: string,
): string[] {
  const oldIndex = keys.indexOf(activeKey)
  const newIndex = keys.indexOf(overKey)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return keys
  const next = [...keys]
  const [moved] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, moved!)
  return next
}

export function orderPatches(
  previousIds: number[],
  nextIds: number[],
): { id: number; featuredOrder: number }[] {
  const patches: { id: number; featuredOrder: number }[] = []
  for (let i = 0; i < nextIds.length; i++) {
    const id = nextIds[i]!
    const prevIndex = previousIds.indexOf(id)
    if (prevIndex !== i) {
      patches.push({ id, featuredOrder: i })
    }
  }
  return patches
}

/**
 * How a drag is renumbered depends on who reads the result.
 *
 * `"global"` — one sequence across every source in the list. The carousel
 * pools all its sources into a single slide order, so numbering each category
 * from zero would hand several of them the same `featuredOrder` and leave the
 * order between them up to raw ids, which is not what the admin dragged.
 *
 * `"category"` — a separate sequence per source. Page highlights are read by
 * different pages that never see each other's rows: services order the band on
 * `/services`, About records order `/about`. Numbering them in one sequence
 * would leave whichever page sorts second starting at an arbitrary offset.
 */
export type FeaturedOrderScope = "global" | "category"

export function featuredOrderPatches<
  T extends { key: string; category: string; featuredOrder?: number | null },
>(
  itemsByKey: Map<string, T>,
  orderedKeys: string[],
  scope: FeaturedOrderScope = "global",
): { key: string; featuredOrder: number }[] {
  const patches: { key: string; featuredOrder: number }[] = []
  const positions = new Map<string, number>()

  for (const key of orderedKeys) {
    const item = itemsByKey.get(key)
    if (!item) continue
    const bucket = scope === "global" ? "" : item.category
    const position = positions.get(bucket) ?? 0
    if ((item.featuredOrder ?? -1) !== position) {
      patches.push({ key, featuredOrder: position })
    }
    positions.set(bucket, position + 1)
  }
  return patches
}
