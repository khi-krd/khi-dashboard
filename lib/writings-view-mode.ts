export type WritingsViewMode = "shelf" | "table"

const STORAGE_KEY = "khi.writings.viewMode"

export function getStoredViewMode(): WritingsViewMode {
  if (typeof window === "undefined") return "shelf"
  const v = localStorage.getItem(STORAGE_KEY)
  return v === "table" ? "table" : "shelf"
}

export function setStoredViewMode(mode: WritingsViewMode) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, mode)
}
