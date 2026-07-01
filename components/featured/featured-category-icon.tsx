"use client"

import {
  BookOpenIcon,
  BriefcaseIcon,
  FilmIcon,
  MusicalNoteIcon,
  NewspaperIcon,
  PhotoIcon,
  RectangleStackIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

import type { FeaturedCatalogItem } from "@/lib/featured-catalog"

export function FeaturedCategoryIcon({
  category,
  className = "size-5",
}: {
  category: FeaturedCatalogItem["category"]
  className?: string
}) {
  switch (category) {
    case "news":
      return <NewspaperIcon className={className} aria-hidden />
    case "projects":
      return <RectangleStackIcon className={className} aria-hidden />
    case "services":
      return <BriefcaseIcon className={className} aria-hidden />
    case "videos":
      return <FilmIcon className={className} aria-hidden />
    case "sounds":
      return <MusicalNoteIcon className={className} aria-hidden />
    case "collections":
      return <PhotoIcon className={className} aria-hidden />
    case "writings":
      return <BookOpenIcon className={className} aria-hidden />
    default:
      return <SparklesIcon className={className} aria-hidden />
  }
}
