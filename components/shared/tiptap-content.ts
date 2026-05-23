/** Detect whether stored content is HTML or Markdown for TipTap `contentType`. */
export function tiptapContentType(
  value: string | null | undefined,
): "html" | "markdown" {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "markdown"
  // Anything that doesn't open with a tag is Markdown — including Markdown that
  // embeds raw media blocks (e.g. `<video>` / `<div class="gallery">`) further
  // down, which the previous "any tag → HTML" check misclassified.
  if (!trimmed.startsWith("<")) return "markdown"
  // The Markdown editor emits media as leading raw HTML in some documents; keep
  // those as Markdown so any surrounding prose still parses as Markdown.
  if (/^<(video|audio|img)\b/i.test(trimmed)) return "markdown"
  if (/^<div\s+class="(gallery|video|audio|file)"/i.test(trimmed))
    return "markdown"
  // Otherwise treat as legacy HTML (e.g. `<p>`, `<h1>`, `<ul>`, `<table>` …).
  return "html"
}
