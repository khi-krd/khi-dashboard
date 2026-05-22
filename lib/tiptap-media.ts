import type { Editor } from "@tiptap/react"

import type { MediaUploadType } from "@/types/media"

export function mediaTypeFromFile(file: File): MediaUploadType {
  const mime = file.type.toLowerCase()
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  return "document"
}

export function insertUploadedMedia(
  editor: Editor,
  fileUrl: string,
  mime?: string,
) {
  const type = mime?.toLowerCase() ?? ""
  if (type.startsWith("video/")) {
    editor
      .chain()
      .focus()
      .insertContent(`<video controls src="${escapeAttr(fileUrl)}"></video>`, {
        contentType: "markdown",
      })
      .run()
    return
  }
  if (type.startsWith("audio/")) {
    editor
      .chain()
      .focus()
      .insertContent(`<audio controls src="${escapeAttr(fileUrl)}"></audio>`, {
        contentType: "markdown",
      })
      .run()
    return
  }
  editor
    .chain()
    .focus()
    .insertContent(`![](${fileUrl})`, { contentType: "markdown" })
    .run()
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}
