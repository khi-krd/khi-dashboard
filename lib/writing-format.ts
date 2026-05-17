import { formatBytes } from "@/lib/sound-format"
import type { BookFileFormat } from "@/types/writings"

export { formatBytes as humanReadableSize }

export function guessBookFormatFromFilename(
  name: string,
): BookFileFormat {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf") return "PDF"
  if (ext === "docx" || ext === "doc") return "DOCX"
  if (ext === "epub") return "EPUB"
  if (ext === "txt") return "TXT"
  return "OTHER"
}

export function urlBasename(url: string | null | undefined): string {
  if (!url?.trim()) return ""
  try {
    const path = new URL(url, "https://placeholder.local").pathname
    return path.split("/").pop() ?? url
  } catch {
    return url.split("/").pop() ?? url
  }
}
