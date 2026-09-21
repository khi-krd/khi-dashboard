type PagedResult<T> = {
  content: T[]
  totalElements?: number
  totalPages?: number
}

const PAGE_SIZE = 100
const MAX_PAGES = 50

/**
 * Drains a paged list endpoint into one array.
 *
 * Some services clamp `size` server-side (videos cap at 100), so the loop
 * keys off `totalPages`/`totalElements` instead of the requested size and
 * stops early when a page comes back short.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PagedResult<T>>,
): Promise<T[]> {
  const all: T[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await fetchPage(page, PAGE_SIZE)
    const batch = result.content ?? []
    all.push(...batch)
    if (
      batch.length === 0 ||
      (result.totalPages != null && page >= result.totalPages - 1) ||
      (result.totalElements != null && all.length >= result.totalElements)
    ) {
      break
    }
  }
  return all
}
