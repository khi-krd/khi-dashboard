import { tiptapContentType } from "@/components/shared/tiptap-content"

/**
 * Lightweight (regex-only, no `marked`/`dompurify`) emptiness check for stored
 * rich text. Kept separate from `sanitize-news-html` so form/validation bundles
 * don't pull in the heavy Markdown + sanitizer libraries.
 */

function stripHtmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function stripMarkdownText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** True when rich text (Markdown or HTML) has no visible content. */
export function isRichTextEmpty(content: string | undefined | null): boolean {
  const t = (content ?? "").trim()
  if (!t) return true
  if (tiptapContentType(t) === "html") {
    return stripHtmlText(t).length === 0
  }
  return stripMarkdownText(t).length === 0
}
