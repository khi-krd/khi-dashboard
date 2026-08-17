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
 * Numbers the drag order across every source at once, not per category.
 *
 * The carousel pools all nine sources into one list sorted on `featuredOrder`,
 * breaking ties by newest id. Numbering each category from zero would hand
 * several sources the same `featuredOrder`, leaving the order between them up
 * to raw ids — so the carousel would not match what the admin dragged. One
 * global sequence is the only way the two agree.
 */
export function featuredOrderPatches<
  T extends { key: string; featuredOrder?: number | null },
>(itemsByKey: Map<string, T>, orderedKeys: string[]): { key: string; featuredOrder: number }[] {
  const patches: { key: string; featuredOrder: number }[] = []
  let position = 0
  for (const key of orderedKeys) {
    const item = itemsByKey.get(key)
    if (!item) continue
    if ((item.featuredOrder ?? -1) !== position) {
      patches.push({ key, featuredOrder: position })
    }
    position += 1
  }
  return patches
}
