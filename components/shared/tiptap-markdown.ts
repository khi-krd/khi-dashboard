import type { Editor } from "@tiptap/react"

/** Serialize editor document as Markdown (requires `Markdown` extension). */
export function getEditorMarkdown(editor: Editor): string {
  return editor.getMarkdown()
}
