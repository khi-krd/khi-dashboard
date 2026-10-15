/**
 * Detect whether stored content is HTML or Markdown for TipTap `contentType`.
 * Mirrors `richTextContentType` in the public site — keep the two in sync.
 */
const BLOCK_HTML = /<(p|h[1-6]|ul|ol|li|table|blockquote|figure|pre|hr)[\s>/]/i

export function tiptapContentType(
  value: string | null | undefined,
): "html" | "markdown" {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "markdown"
  // Anything that doesn't open with a tag is Markdown — including Markdown that
  // embeds raw media blocks (e.g. `<video>` / `<div class="gallery">`) further
  // down, which the previous "any tag → HTML" check misclassified.
  if (!trimmed.startsWith("<")) return "markdown"
  // Editor-authored HTML wraps every paragraph, so a document that opens with
  // a media block (figure, gallery, img…) but carries block tags is HTML.
  if (BLOCK_HTML.test(trimmed)) return "html"
  // The Markdown editor used to emit media as leading raw HTML; keep those as
  // Markdown so any surrounding prose still parses as Markdown.
  if (/^<(video|audio|img)\b/i.test(trimmed)) return "markdown"
  if (/^<div\s+class="(gallery|video|audio|file)"/i.test(trimmed))
    return "markdown"
  return "html"
}
