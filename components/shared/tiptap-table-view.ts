import { TableView } from "@tiptap/extension-table"
import type { Node as PMNode } from "@tiptap/pm/model"
import type { EditorView, ViewMutationRecord } from "@tiptap/pm/view"

import { TIPTAP_NS } from "@/components/shared/tiptap-strings"

/**
 * Tiptap's resizable {@link TableView} plus a caption field under the table
 * and the `data-style` preset mirrored onto the `<table>` element, so the
 * editor shows what `RichTable.renderHTML` emits for the public site.
 *
 * The caption is a node attribute (see `RichTable`), edited through a plain
 * `<input>` that lives inside the node view but outside `contentDOM` —
 * ProseMirror must neither interpret its keystrokes nor treat its DOM
 * mutations as document changes, hence `stopEvent` / `ignoreMutation`.
 */
export class CaptionedTableView extends TableView {
  private readonly view: EditorView | undefined
  private readonly caption: HTMLElement
  private readonly input: HTMLInputElement

  constructor(node: PMNode, cellMinWidth: number, view?: EditorView) {
    super(node, cellMinWidth)
    this.view = view
    this.dom.classList.add("rt-table")

    this.caption = document.createElement("figcaption")
    this.caption.className = "rt-table-caption"
    this.input = document.createElement("input")
    this.input.type = "text"
    this.input.className = "rt-caption-input"
    this.input.placeholder = TIPTAP_NS.table.captionPlaceholder
    this.input.value = (node.attrs.caption as string) ?? ""
    this.input.addEventListener("input", () => this.commitCaption())
    this.caption.appendChild(this.input)
    this.dom.appendChild(this.caption)

    this.applyAttrs(node)
  }

  update(node: PMNode): boolean {
    if (!super.update(node)) return false
    this.applyAttrs(node)
    const caption = (node.attrs.caption as string) ?? ""
    if (document.activeElement !== this.input && this.input.value !== caption) {
      this.input.value = caption
    }
    return true
  }

  stopEvent(event: Event): boolean {
    return this.caption.contains(event.target as Node)
  }

  ignoreMutation(mutation: ViewMutationRecord): boolean {
    if (this.caption.contains(mutation.target as Node)) return true
    return super.ignoreMutation(mutation)
  }

  private applyAttrs(node: PMNode) {
    const style = (node.attrs.tableStyle as string) ?? "grid"
    this.table.setAttribute("data-style", style)
    const editable = this.view?.editable ?? true
    this.caption.hidden = !editable && !(node.attrs.caption as string)
    this.input.readOnly = !editable
  }

  private commitCaption() {
    const view = this.view
    if (!view) return
    const pos = this.findPos(view)
    if (pos === null) return
    view.dispatch(
      view.state.tr.setNodeMarkup(pos, undefined, {
        ...this.node.attrs,
        caption: this.input.value,
      }),
    )
  }

  /** The node view receives no `getPos`; locate the live node by identity. */
  private findPos(view: EditorView): number | null {
    let found: number | null = null
    view.state.doc.descendants((n, pos) => {
      if (found !== null) return false
      if (n === this.node) {
        found = pos
        return false
      }
      return true
    })
    return found
  }
}
