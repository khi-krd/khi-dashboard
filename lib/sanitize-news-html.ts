import { tiptapContentType } from "@/components/shared/tiptap-content"
import DOMPurify from "dompurify"
import { marked } from "marked"

export { isRichTextEmpty } from "@/lib/rich-text-empty"

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "a",
  "strong",
  "em",
  "u",
  "s",
  "img",
  "video",
  "audio",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "br",
  "div",
] as const

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "class",
      "controls",
      "download",
    ],
    KEEP_CONTENT: false,
  })
}

function markdownToHtml(md: string): string {
  const html = marked.parse(md, { async: false, gfm: true }) as string
  return sanitizeHtml(html)
}

/**
 * Render stored rich text for `dangerouslySetInnerHTML`.
 * Accepts Markdown (preferred) or legacy HTML from the API.
 */
export function sanitizeNewsBodyHtml(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ""
  if (tiptapContentType(trimmed) === "markdown") {
    return markdownToHtml(trimmed)
  }
  return sanitizeHtml(trimmed)
}
