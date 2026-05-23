import type { Editor } from "@tiptap/react"

import type { GalleryImage } from "@/components/shared/tiptap-media-nodes"
import type { MediaUploadType } from "@/types/media"

export function mediaTypeFromFile(file: File): MediaUploadType {
  const mime = file.type.toLowerCase()
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  return "document"
}

/** Insert a single image as Markdown (`![](url)`). */
export function insertUploadedImage(editor: Editor, fileUrl: string) {
  editor
    .chain()
    .focus()
    .insertContent(`![](${fileUrl})`, { contentType: "markdown" })
    .run()
}

/** Insert an uploaded video as a `video` node. */
export function insertUploadedVideo(editor: Editor, fileUrl: string) {
  editor
    .chain()
    .focus()
    .insertContent({ type: "video", attrs: { src: fileUrl } })
    .run()
}

/** Insert an uploaded audio file as an `audio` node. */
export function insertUploadedAudio(editor: Editor, fileUrl: string) {
  editor
    .chain()
    .focus()
    .insertContent({ type: "audio", attrs: { src: fileUrl } })
    .run()
}

/** Insert multiple images as a single `gallery` node. */
export function insertUploadedGallery(editor: Editor, images: GalleryImage[]) {
  if (!images.length) return
  editor
    .chain()
    .focus()
    .insertContent({ type: "gallery", attrs: { images } })
    .run()
}

/**
 * Derive a human-readable file name from an upload URL when the API didn't
 * return one. Falls back to the last path segment, stripping the `<uuid>-`
 * prefix the media service prepends to stored objects.
 */
export function fileNameFromUrl(url: string): string {
  let segment = url
  try {
    const path = new URL(url).pathname
    segment = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1))
  } catch {
    segment = url.substring(url.lastIndexOf("/") + 1) || url
  }
  return segment.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
    "",
  )
}

/** Insert an uploaded document / other file as a `fileLink` node. */
export function insertUploadedFile(
  editor: Editor,
  fileUrl: string,
  name?: string,
) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: "fileLink",
      attrs: { href: fileUrl, name: name?.trim() || fileNameFromUrl(fileUrl) },
    })
    .run()
}

/** Insert uploaded media, routing by MIME type to the right node/markup. */
export function insertUploadedMedia(
  editor: Editor,
  fileUrl: string,
  mime?: string,
) {
  const type = mime?.toLowerCase() ?? ""
  if (type.startsWith("video/")) return insertUploadedVideo(editor, fileUrl)
  if (type.startsWith("audio/")) return insertUploadedAudio(editor, fileUrl)
  return insertUploadedImage(editor, fileUrl)
}
