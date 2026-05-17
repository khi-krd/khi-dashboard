export type CollectionsViewMode = "grid" | "table"

const STORAGE_KEY = "khi.image-collections.viewMode"

export function getStoredViewMode(): CollectionsViewMode {
  if (typeof window === "undefined") return "grid"
  const v = localStorage.getItem(STORAGE_KEY)
  return v === "table" ? "table" : "grid"
}

export function setStoredViewMode(mode: CollectionsViewMode) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, mode)
}
