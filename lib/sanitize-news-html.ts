import DOMPurify from "dompurify"

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
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "br",
] as const

/** Sanitize news body HTML before `dangerouslySetInnerHTML`. */
export function sanitizeNewsBodyHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
    KEEP_CONTENT: false,
  })
}
