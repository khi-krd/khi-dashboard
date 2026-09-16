import {
  createCollectionJson,
  createCollectionMultipart,
  updateCollectionMultipart,
} from "@/services/imageCollectionsService"
import type { UploadProgressHandler } from "@/lib/axios"
import type { CollectionDto } from "@/types/image-collections"
import type {
  CollectionFormValues,
  ImageItemFormValues,
} from "@/lib/validations/image-collections"

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

function itemHasSource(item: ImageItemFormValues): boolean {
  return !!(
    item.imageUrl?.trim() ||
    item.externalUrl?.trim() ||
    item.embedUrl?.trim() ||
    item.stagedBinary
  )
}

// The backend pairs the i-th non-empty `images` part with `imageAlbum[i]`, so
// file-backed items must lead the array. Partitioning is stable within each
// group; `sortOrder` keeps the original form position.
export function orderedAlbumItems(
  values: CollectionFormValues,
): ImageItemFormValues[] {
  const sourced = values.imageAlbum.filter(itemHasSource)
  return [
    ...sourced.filter((item) => item.stagedBinary),
    ...sourced.filter((item) => !item.stagedBinary),
  ]
}

function buildAlbumPayload(values: CollectionFormValues) {
  const formPosition = new Map(
    values.imageAlbum.filter(itemHasSource).map((item, i) => [item, i]),
  )

  let album = orderedAlbumItems(values).map((item) => ({
    ...(typeof item.id === "number" && item.id > 0 ? { id: item.id } : {}),
    // URL fields on a staged item are ignored by the backend — omit them.
    ...(item.stagedBinary
      ? {}
      : {
          imageUrl: trimOrUndef(item.imageUrl),
          externalUrl: trimOrUndef(item.externalUrl),
          embedUrl: trimOrUndef(item.embedUrl),
        }),
    captionCkb: trimOrUndef(item.captionCkb),
    captionKmr: trimOrUndef(item.captionKmr),
    descriptionCkb: item.descriptionCkb?.trim() || undefined,
    descriptionKmr: item.descriptionKmr?.trim() || undefined,
    sortOrder: formPosition.get(item) ?? 0,
  }))

  if (values.collectionType === "SINGLE" && album.length > 1) {
    album = [album[0]!]
  }

  return album
}

// PUT is a partial merge where "" still overwrites, so on edit we send only
// the keys that carry a value.
function editContentPayload(content: CollectionFormValues["ckbContent"]) {
  const out: Record<string, string> = {}
  const title = trimOrUndef(content?.title)
  if (title) out.title = title
  const description = content?.description?.trim()
  if (description && description !== "<p></p>") out.description = description
  const location = trimOrUndef(content?.location)
  if (location) out.location = location
  const collectedBy = trimOrUndef(content?.collectedBy)
  if (collectedBy) out.collectedBy = collectedBy
  return Object.keys(out).length > 0 ? out : undefined
}

export function collectionFormValuesToPayload(
  mode: "create" | "edit",
  collectionId: number | undefined,
  values: CollectionFormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    collectionType: values.collectionType,
    contentLanguages: values.contentLanguages,
    publishmentDate:
      mode === "edit"
        ? trimOrUndef(values.publishmentDate)
        : values.publishmentDate?.trim() || null,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
    ckbContent: values.contentLanguages.includes("CKB")
      ? mode === "edit"
        ? editContentPayload(values.ckbContent)
        : {
            title: values.ckbContent?.title?.trim() ?? "",
            description: values.ckbContent?.description ?? "",
            location: trimOrUndef(values.ckbContent?.location),
            collectedBy: trimOrUndef(values.ckbContent?.collectedBy),
          }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? mode === "edit"
        ? editContentPayload(values.kmrContent)
        : {
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

  for (const item of orderedAlbumItems(values)) {
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
  onProgress?: UploadProgressHandler,
): Promise<CollectionDto> {
  // PUT is multipart-only; even a text-only edit must go through FormData.
  if (mode === "edit" && collectionId != null) {
    const fd = collectionFormValuesToMultipart(mode, collectionId, values)
    return updateCollectionMultipart(collectionId, fd, onProgress)
  }

  if (hasAnyStagedBinary(values)) {
    const fd = collectionFormValuesToMultipart(mode, collectionId, values)
    return createCollectionMultipart(fd, onProgress)
  }
  return createCollectionJson(
    collectionFormValuesToPayload(mode, collectionId, values),
  )
}
