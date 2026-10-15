import {
  Extension,
  mergeAttributes,
  Node,
  ReactNodeViewRenderer,
  type JSONContent,
} from "@tiptap/react"
import { Table, TableCell, TableHeader } from "@tiptap/extension-table"
import { type DOMOutputSpec, Fragment } from "@tiptap/pm/model"

import { ImageFigureView } from "@/components/shared/tiptap-figure-view"
import { CaptionedTableView } from "@/components/shared/tiptap-table-view"

/**
 * Word-like layout nodes for the rich-text editor. Content is persisted as
 * HTML (see `tiptap-editor.tsx`), so every node here owns a stable HTML shape
 * that the public site's sanitizer allowlist (`khi-webiste/src/lib/rich-text/
 * sanitize.ts`) and `.prose` stylesheet understand:
 *
 *  - `<figure class="rt-figure" data-align data-width><img><figcaption>`
 *  - `<figure class="rt-table"><table data-style>…</table><figcaption>`
 *  - `<div class="rt-columns" data-cols><div class="rt-column">…`
 *  - `dir="rtl|ltr"` on block elements
 *
 * Captions are node *attributes* (plain text) rather than editable child
 * nodes — that keeps the schema free of "image without caption" states the
 * ProseMirror fitter would otherwise have to repair on delete.
 */

export type FigureAlign =
  | "center"
  | "full"
  | "left"
  | "right"
  | "behind"
export type FigureWidth = 25 | 33 | 50 | 66 | 75 | 100
export type TableStyle = "grid" | "striped" | "borderless" | "minimal"
export type TextDir = "rtl" | "ltr"

export const FIGURE_ALIGNS: FigureAlign[] = [
  "center",
  "full",
  "left",
  "right",
  "behind",
]
export const FIGURE_WIDTHS: FigureWidth[] = [25, 33, 50, 66, 75, 100]
export const TABLE_STYLES: TableStyle[] = [
  "grid",
  "striped",
  "borderless",
  "minimal",
]

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockDirection: {
      setTextDirection: (dir: TextDir) => ReturnType
      unsetTextDirection: () => ReturnType
    }
    imageFigure: {
      insertImageFigure: (attrs: {
        src: string
        alt?: string
        caption?: string
        align?: FigureAlign
        width?: FigureWidth
      }) => ReturnType
      setImageFigureAlign: (align: FigureAlign) => ReturnType
      setImageFigureWidth: (width: FigureWidth) => ReturnType
    }
    richTable: {
      insertCaptionedTable: (opts?: {
        rows?: number
        cols?: number
        withHeaderRow?: boolean
      }) => ReturnType
      setTableStyle: (style: TableStyle | null) => ReturnType
      setTableCaption: (caption: string) => ReturnType
      setCellBackground: (color: string | null) => ReturnType
    }
    columns: {
      insertColumns: (count: 2 | 3) => ReturnType
      unsetColumns: () => ReturnType
    }
  }
}

// ============================================================
// Text direction — `dir` on every block element
// ============================================================

const DIRECTION_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "blockquote",
  "tableCell",
  "tableHeader",
]

export const TextDirection = Extension.create({
  // Not "textDirection": that name belongs to a core Tiptap extension.
  name: "blockDirection",

  addGlobalAttributes() {
    return [
      {
        types: DIRECTION_TYPES,
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => {
              const dir = element.getAttribute("dir")
              return dir === "rtl" || dir === "ltr" ? dir : null
            },
            renderHTML: (attributes) =>
              attributes.dir ? { dir: attributes.dir } : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextDirection:
        (dir) =>
        ({ commands }) =>
          DIRECTION_TYPES.map((type) =>
            commands.updateAttributes(type, { dir }),
          ).some(Boolean),
      unsetTextDirection:
        () =>
        ({ commands }) =>
          DIRECTION_TYPES.map((type) =>
            commands.resetAttributes(type, "dir"),
          ).some(Boolean),
    }
  },
})

// ============================================================
// Image figure — image + caption + Word-like placement
// ============================================================

export const ImageFigure = Node.create({
  name: "imageFigure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("src") ?? null,
        renderHTML: () => ({}),
      },
      alt: {
        default: "",
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("alt") ?? "",
        renderHTML: () => ({}),
      },
      caption: {
        default: "",
        parseHTML: (element) =>
          element.querySelector("figcaption")?.textContent?.trim() ?? "",
        renderHTML: () => ({}),
      },
      align: {
        default: "center" as FigureAlign,
        parseHTML: (element) => {
          const value = element.getAttribute("data-align")
          return FIGURE_ALIGNS.includes(value as FigureAlign) ? value : "center"
        },
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      width: {
        default: 100 as FigureWidth,
        parseHTML: (element) => {
          const value = Number(element.getAttribute("data-width"))
          return FIGURE_WIDTHS.includes(value as FigureWidth) ? value : 100
        },
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: "figure.rt-figure" },
      // Any <figure> wrapping an image (legacy HTML, pasted content).
      {
        tag: "figure",
        getAttrs: (element) =>
          (element as HTMLElement).querySelector("img") ? null : false,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const src = (node.attrs.src as string | null) ?? ""
    const alt = (node.attrs.alt as string) ?? ""
    const caption = (node.attrs.caption as string) ?? ""
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { class: "rt-figure" }),
      ["img", { src, alt, loading: "lazy" }],
      ["figcaption", {}, caption],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureView)
  },

  addCommands() {
    return {
      insertImageFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src,
              alt: attrs.alt ?? "",
              caption: attrs.caption ?? "",
              align: attrs.align ?? "center",
              width: attrs.width ?? 100,
            },
          }),
      setImageFigureAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
      setImageFigureWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { width }),
    }
  },

  renderMarkdown: (node: JSONContent) => {
    const src = (node.attrs?.src as string | undefined) ?? ""
    if (!src) return ""
    const alt = (node.attrs?.alt as string | undefined) ?? ""
    const caption = (node.attrs?.caption as string | undefined) ?? ""
    const img = `![${alt}](${src})`
    return caption ? `${img}\n\n*${caption}*` : img
  },
})

// ============================================================
// Tables — caption, style preset, cell backgrounds
// ============================================================

export const RichTable = Table.extend({
  addOptions() {
    const parent = this.parent?.()
    return {
      ...(parent as NonNullable<typeof parent>),
      View: CaptionedTableView,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      // Attribute parsers receive either the <figure class="rt-table"> (our
      // own output) or a bare <table> (legacy/pasted HTML); a null result
      // keeps the default rather than overriding the rule's getAttrs.
      caption: {
        default: "",
        parseHTML: (element) =>
          (element.tagName === "FIGURE"
            ? element
            : element.closest("figure.rt-table")
          )?.querySelector(":scope > figcaption")?.textContent?.trim() || null,
        renderHTML: () => ({}),
      },
      tableStyle: {
        default: "grid" as TableStyle,
        parseHTML: (element) => {
          const table =
            element.tagName === "TABLE" ? element : element.querySelector("table")
          const value = table?.getAttribute("data-style")
          return TABLE_STYLES.includes(value as TableStyle) ? value : null
        },
        renderHTML: (attributes) => ({ "data-style": attributes.tableStyle }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: "figure.rt-table", contentElement: "table" },
      { tag: "table" },
    ]
  },

  renderHTML(props) {
    const table = this.parent?.(props) as DOMOutputSpec
    const caption = (props.node.attrs.caption as string) ?? ""
    return ["figure", { class: "rt-table" }, table, ["figcaption", {}, caption]]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertCaptionedTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) =>
        ({ chain }) =>
          chain().insertTable({ rows, cols, withHeaderRow }).run(),
      setTableStyle:
        (style) =>
        ({ commands }) =>
          commands.updateAttributes("table", { tableStyle: style ?? "grid" }),
      setTableCaption:
        (caption) =>
        ({ commands }) =>
          commands.updateAttributes("table", { caption }),
      setCellBackground:
        (color) =>
        ({ commands }) =>
          ["tableCell", "tableHeader"]
            .map((type) =>
              commands.updateAttributes(type, { backgroundColor: color }),
            )
            .some(Boolean),
    }
  },
})

const cellBackgroundAttribute = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) =>
      element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
}

export const RichTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackgroundAttribute }
  },
})

export const RichTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackgroundAttribute }
  },
})

// ============================================================
// Columns — side-by-side text (2 or 3 columns)
// ============================================================

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,

  parseHTML() {
    return [{ tag: "div.rt-column" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "rt-column" }), 0]
  },
})

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,3}",
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element) =>
          element.getAttribute("data-cols") === "3" ? 3 : 2,
        renderHTML: (attributes) => ({ "data-cols": attributes.cols }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div.rt-columns" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "rt-columns" }), 0]
  },

  addCommands() {
    return {
      insertColumns:
        (count) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { cols: count },
            content: Array.from({ length: count }, () => ({
              type: "column",
              content: [{ type: "paragraph" }],
            })),
          }),
      unsetColumns:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (node.type.name !== this.name) continue
            const pos = $from.before(depth)
            const blocks: Fragment[] = []
            node.forEach((column) => blocks.push(column.content))
            if (dispatch) {
              tr.replaceWith(
                pos,
                pos + node.nodeSize,
                blocks.reduce(
                  (acc, frag) => acc.append(frag),
                  Fragment.empty,
                ),
              )
            }
            return true
          }
          return false
        },
    }
  },
})
