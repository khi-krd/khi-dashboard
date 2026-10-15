import type { Editor } from "@tiptap/react"

/** Serialize editor document as Markdown (requires `Markdown` extension). */
export function getEditorMarkdown(editor: Editor): string {
  return editor.getMarkdown()
}

/**
 * Serialize the editor document as HTML — the persisted format. Markdown
 * cannot carry fonts, sizes, colors, text direction, image placement,
 * captions or table styling, so rich documents are stored as the HTML the
 * public site already sanitizes and renders. An empty document yields ""
 * (not `<p></p>`) so "no description" stays falsy for the forms.
 */
export function getEditorHtml(editor: Editor): string {
  return editor.isEmpty ? "" : editor.getHTML()
}
