import type { FeaturedCatalogCategory } from "@/lib/featured-catalog"

export type StoredFeaturedCategory = Exclude<FeaturedCatalogCategory, "all">

type StoredFeaturedEntry = {
  featuredOrder: number
}

type StoredFeaturedState = Record<
  StoredFeaturedCategory,
  Record<string, StoredFeaturedEntry>
>

const STORAGE_KEY = "khi-featured-state-v1"

const CATEGORIES: StoredFeaturedCategory[] = [
  "news",
  "projects",
  "services",
  "videos",
  "sounds",
  "collections",
  "writings",
]

function emptyBucket(): Record<string, StoredFeaturedEntry> {
  return {}
}

function emptyState(): StoredFeaturedState {
  return {
    news: emptyBucket(),
    projects: emptyBucket(),
    services: emptyBucket(),
    videos: emptyBucket(),
    sounds: emptyBucket(),
    collections: emptyBucket(),
    writings: emptyBucket(),
  }
}

export function readStoredFeaturedState(): StoredFeaturedState {
  if (typeof window === "undefined") return emptyState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<StoredFeaturedState>
    const state = emptyState()
    for (const category of CATEGORIES) {
      state[category] = parsed[category] ?? {}
    }
    return state
  } catch {
    return emptyState()
  }
}

export function writeStoredFeaturedState(state: StoredFeaturedState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
}

export function setStoredFeatured(
  category: StoredFeaturedCategory,
  id: number,
  featured: boolean,
  featuredOrder: number | null,
) {
  const state = readStoredFeaturedState()
  const bucket = state[category]
  const key = String(id)
  if (!featured) {
    delete bucket[key]
  } else {
    bucket[key] = { featuredOrder: featuredOrder ?? 0 }
  }
  writeStoredFeaturedState(state)
}

export function getStoredFeaturedIds(category: StoredFeaturedCategory) {
  const state = readStoredFeaturedState()
  const bucket = state[category]
  return Object.entries(bucket).map(([id, entry]) => ({
    id: Number(id),
    featuredOrder: entry.featuredOrder,
  }))
}
