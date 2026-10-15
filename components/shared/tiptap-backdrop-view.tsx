"use client"

import { useState } from "react"
import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react"
import {
  ArrowsUpDownIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

import {
  FIGURE_WIDTHS,
  type BackdropPos,
  type FigureWidth,
} from "@/components/shared/tiptap-rich-nodes"
import { ImageInsertDialog } from "@/components/shared/tiptap-toolbar-rich"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { cn } from "@/lib/utils"

/**
 * Editor view for {@link ImageBackdrop}: the picture layer under/over the
 * editable body, plus a hover bar — behind/front toggle, width, replace
 * image, drag grip and remove. The body is a real NodeViewContent, so the
 * user types straight onto the image like Word's "Behind Text".
 */
export function ImageBackdropView({
  node,
  selected,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const src = (node.attrs.src as string | null) ?? ""
  const alt = (node.attrs.alt as string) ?? ""
  const pos = (node.attrs.pos as BackdropPos) ?? "behind"
  const width = (node.attrs.width as FigureWidth) ?? 100
  const editable = editor.isEditable

  return (
    <NodeViewWrapper
      className={cn(
        "rt-backdrop",
        selected && editable && "rt-figure-selected",
      )}
      data-pos={pos}
      data-width={width}
    >
      <div className="rt-backdrop-layer" contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="rt-backdrop-img" src={src} alt={alt} draggable={false} />
      </div>
      <NodeViewContent className="rt-backdrop-body" />
      {editable ? (
        <div
          contentEditable={false}
          className="rt-figure-bar rt-backdrop-bar border-border bg-popover text-popover-foreground flex flex-wrap items-center gap-0.5 rounded-md border p-1 shadow-md"
          dir="rtl"
        >
          <span
            data-drag-handle
            draggable
            title={TIPTAP_NS.figure.drag}
            aria-label={TIPTAP_NS.figure.drag}
            className="hover:bg-accent flex size-7 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
          >
            <ArrowsUpDownIcon className="size-4" />
          </span>
          <span className="bg-border mx-0.5 h-5 w-px" />
          <button
            type="button"
            title={TIPTAP_NS.figure.alignLabel.behind}
            aria-pressed={pos === "behind"}
            onClick={() => updateAttributes({ pos: "behind" })}
            className={cn(
              "h-7 rounded-md px-2 text-xs",
              pos === "behind"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent",
            )}
          >
            {TIPTAP_NS.figure.alignLabel.behind}
          </button>
          <button
            type="button"
            title={TIPTAP_NS.figure.alignLabel.front}
            aria-pressed={pos === "front"}
            onClick={() => updateAttributes({ pos: "front" })}
            className={cn(
              "h-7 rounded-md px-2 text-xs",
              pos === "front"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent",
            )}
          >
            {TIPTAP_NS.figure.alignLabel.front}
          </button>
          <span className="bg-border mx-0.5 h-5 w-px" />
          <select
            className="bg-background h-7 rounded border px-1 text-xs"
            value={width}
            title={TIPTAP_NS.figure.width}
            onChange={(e) =>
              updateAttributes({ width: Number(e.target.value) })
            }
          >
            {FIGURE_WIDTHS.map((w) => (
              <option key={w} value={w}>
                {w}%
              </option>
            ))}
          </select>
          <button
            type="button"
            title={TIPTAP_NS.figure.editTitle}
            aria-label={TIPTAP_NS.figure.editTitle}
            className="hover:bg-accent flex size-7 items-center justify-center rounded-md"
            onClick={() => setMoreOpen(true)}
          >
            <PhotoIcon className="size-4" />
          </button>
          <button
            type="button"
            title={TIPTAP_NS.figure.remove}
            aria-label={TIPTAP_NS.figure.remove}
            onClick={() => deleteNode()}
            className="text-destructive hover:bg-accent flex size-7 items-center justify-center rounded-md"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      ) : null}
      {editable ? (
        <ImageInsertDialog
          editor={editor}
          open={moreOpen}
          onOpenChange={setMoreOpen}
          initial={{ src, alt, width }}
          onApply={(attrs) =>
            updateAttributes({
              src: attrs.src,
              alt: attrs.alt,
              width: attrs.width,
            })
          }
        />
      ) : null}
    </NodeViewWrapper>
  )
}
