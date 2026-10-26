import type { KeyboardEvent } from "react"

/**
 * Stops native implicit form submission: pressing Enter inside a text input
 * would otherwise save the whole record while the editor is still typing.
 * Buttons (activation), textareas (newline), selects, file pickers and
 * rich-text editors keep their own Enter behavior — only inputs that do
 * nothing useful with Enter are blocked.
 */
const ACTIVATES_ON_ENTER = new Set(["button", "submit", "reset", "image", "file"])

export function preventImplicitFormSubmit(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "Enter") return
  const target = e.target as HTMLElement | null
  if (target?.tagName !== "INPUT") return
  if (ACTIVATES_ON_ENTER.has((target as HTMLInputElement).type)) return
  e.preventDefault()
}
