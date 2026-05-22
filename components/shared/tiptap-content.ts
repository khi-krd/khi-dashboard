/** Detect whether stored content is HTML or Markdown for TipTap `contentType`. */
export function tiptapContentType(
  value: string | null | undefined,
): "html" | "markdown" {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "markdown"
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return "html"
  return "markdown"
}
