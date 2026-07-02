import {
  createCollectionJson,
  createCollectionMultipart,
  updateCollectionJson,
  updateCollectionMultipart,
} from "@/services/imageCollectionsService"
import type { CollectionDto } from "@/types/image-collections"
import type { CollectionFormValues } from "@/lib/validations/image-collections"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export function hasAnyStagedBinary(values: CollectionFormValues): boolean {
  if (values.ckbCoverFile || values.kmrCoverFile || values.hoverCoverFile) {
    return true
  }
  return values.imageAlbum.some((item) => !!item.stagedBinary)
}

function buildAlbumPayload(values: CollectionFormValues) {
  let album = values.imageAlbum
    .filter(
      (item) =>
        item.imageUrl?.trim() ||
        item.externalUrl?.trim() ||
        item.embedUrl?.trim() ||
        item.stagedBinary,
    )
    .map((item, i) => ({
      ...(typeof item.id === "number" && item.id > 0 ? { id: item.id } : {}),
      imageUrl: trimOrUndef(item.imageUrl),
      externalUrl: trimOrUndef(item.externalUrl),
      embedUrl: trimOrUndef(item.embedUrl),
      captionCkb: trimOrUndef(item.captionCkb),
      captionKmr: trimOrUndef(item.captionKmr),
      descriptionCkb: item.descriptionCkb?.trim() || undefined,
      descriptionKmr: item.descriptionKmr?.trim() || undefined,
      sortOrder: item.sortOrder ?? i,
    }))

  if (values.collectionType === "SINGLE" && album.length > 1) {
    album = [album[0]!]
  }

  return album
}

export function collectionFormValuesToPayload(
  mode: "create" | "edit",
  collectionId: number | undefined,
  values: CollectionFormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof collectionId === "number"
      ? { id: collectionId }
      : {}),
    collectionType: values.collectionType,
    contentLanguages: values.contentLanguages,
    publishmentDate: values.publishmentDate?.trim() || null,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: values.ckbContent?.title?.trim() ?? "",
          description: values.ckbContent?.description ?? "",
          location: trimOrUndef(values.ckbContent?.location),
          collectedBy: trimOrUndef(values.ckbContent?.collectedBy),
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: values.kmrContent?.title?.trim() ?? "",
          description: values.kmrContent?.description ?? "",
          location: trimOrUndef(values.kmrContent?.location),
          collectedBy: trimOrUndef(values.kmrContent?.collectedBy),
        }
      : undefined,
    imageAlbum: buildAlbumPayload(values),
    ckbCoverUrl: trimOrUndef(values.ckbCoverUrl),
    kmrCoverUrl: trimOrUndef(values.kmrCoverUrl),
    hoverCoverUrl: trimOrUndef(values.hoverCoverUrl),
  }

  if (values.clearTopic) {
    payload.clearTopic = true
    payload.topicId = null
  } else if (
    values.newTopic?.nameCkb?.trim() ||
    values.newTopic?.nameKmr?.trim()
  ) {
    payload.newTopic = {
      nameCkb: trimOrUndef(values.newTopic.nameCkb),
      nameKmr: trimOrUndef(values.newTopic.nameKmr),
    }
    payload.topicId = null
  } else if (values.topicId != null) {
    payload.topicId = values.topicId
  } else if (mode === "create") {
    payload.topicId = null
  }

  return payload
}

export function collectionFormValuesToMultipart(
  mode: "create" | "edit",
  collectionId: number | undefined,
  values: CollectionFormValues,
): FormData {
  const fd = new FormData()
  const payload = collectionFormValuesToPayload(mode, collectionId, values)

  fd.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  )

  if (values.ckbCoverFile) fd.append("ckbCoverImage", values.ckbCoverFile)
  if (values.kmrCoverFile) fd.append("kmrCoverImage", values.kmrCoverFile)
  if (values.hoverCoverFile) fd.append("hoverCoverImage", values.hoverCoverFile)

  for (const item of values.imageAlbum) {
    if (item.stagedBinary) {
      fd.append("images", item.stagedBinary)
    }
  }

  return fd
}

export async function submitCollection(
  mode: "create" | "edit",
  collectionId: number | undefined,
  values: CollectionFormValues,
): Promise<CollectionDto> {
  if (hasAnyStagedBinary(values)) {
    const fd = collectionFormValuesToMultipart(mode, collectionId, values)
    if (mode === "edit" && collectionId != null) {
      return updateCollectionMultipart(collectionId, fd)
    }
    return createCollectionMultipart(fd)
  }

  const payload = collectionFormValuesToPayload(mode, collectionId, values)
  if (mode === "edit" && collectionId != null) {
    return updateCollectionJson(collectionId, payload)
  }
  return createCollectionJson(payload)
}
