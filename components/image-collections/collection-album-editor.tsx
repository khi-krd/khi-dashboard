"use client"

import { useFormContext } from "react-hook-form"

import { AlbumGalleryEditor } from "@/components/image-collections/album-gallery-editor"
import { AlbumSingleEditor } from "@/components/image-collections/album-single-editor"
import { AlbumStoryEditor } from "@/components/image-collections/album-story-editor"
import type { CollectionFormValues } from "@/lib/validations/image-collections"

export function CollectionAlbumEditor() {
  const { watch } = useFormContext<CollectionFormValues>()
  const collectionType = watch("collectionType")
  const contentLanguages = watch("contentLanguages")
  const showKmrFields = contentLanguages.includes("KMR")

  if (collectionType === "SINGLE") {
    return <AlbumSingleEditor showKmrFields={showKmrFields} />
  }
  if (collectionType === "PHOTO_STORY") {
    return <AlbumStoryEditor showKmrFields={showKmrFields} />
  }
  return <AlbumGalleryEditor showKmrFields={showKmrFields} />
}
