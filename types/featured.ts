export type FeaturedPayload = {
  featured?: boolean
  featuredOrder?: number
  /**
   * The hero picture, sized for the full-screen carousel.
   *
   * Tri-state on the wire, per FEATURE_IMAGE_HERO.md §4.5:
   *   omitted / undefined → leave the stored value alone
   *   ""                  → clear it; the hero falls back to the item's cover
   *   a URL               → trimmed and stored
   *
   * Reorder and unfeature calls omit it, which is why they keep working
   * unchanged and why unfeaturing does not lose the picture.
   */
  featureImageUrl?: string | null
}

export type FeaturedFields = {
  featured?: boolean
  featuredOrder?: number | null
}
