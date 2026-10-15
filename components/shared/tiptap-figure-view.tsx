"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import {
  ArrowsPointingOutIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

import {
  FIGURE_WIDTHS,
  type FigureAlign,
  type FigureWidth,
} from "@/components/shared/tiptap-rich-nodes"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALIGN_ICONS: Record<FigureAlign, typeof Bars3Icon> = {
  center: Bars3Icon,
  full: ArrowsPointingOutIcon,
  left: Bars3BottomLeftIcon,
  right: Bars3BottomRightIcon,
  behind: PhotoIcon,
}

/**
 * React NodeView for {@link ImageFigure}: the picture, an inline caption field
 * and — while the node is selected — a small Word-style placement bar
 * (alignment + width + remove). Everything edits node attributes, so the
 * stored HTML stays the single source of truth.
 */
export function ImageFigureView({
  node,
  selected,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const src = (node.attrs.src as string | null) ?? ""
  const alt = (node.attrs.alt as string) ?? ""
  const caption = (node.attrs.caption as string) ?? ""
  const align = (node.attrs.align as FigureAlign) ?? "center"
  const width = (node.attrs.width as FigureWidth) ?? 100
  const editable = editor.isEditable

  return (
    <NodeViewWrapper
      as="figure"
      className={cn(
        "rt-figure",
        selected && editable && "rt-figure-selected",
      )}
      data-align={align}
      data-width={width}
      data-drag-handle
    >
      <div contentEditable={false} className="rt-figure-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
        {editable ? (
          <div
            className="rt-figure-bar border-border bg-popover text-popover-foreground flex flex-wrap items-center gap-0.5 rounded-md border p-1 shadow-md"
            dir="rtl"
          >
            <span
              data-drag-handle
              title={TIPTAP_NS.figure.drag}
              aria-label={TIPTAP_NS.figure.drag}
              className="hover:bg-accent flex size-7 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
            >
              <ArrowsUpDownIcon className="size-4" />
            </span>
            <span className="bg-border mx-1 h-5 w-px" />
            {(Object.keys(ALIGN_ICONS) as FigureAlign[]).map((value) => {
              const Icon = ALIGN_ICONS[value]
              return (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "size-7",
                    align === value && "bg-accent text-accent-foreground",
                  )}
                  title={TIPTAP_NS.figure.alignLabel[value]}
                  aria-pressed={align === value}
                  onClick={() => updateAttributes({ align: value })}
                >
                  <Icon className="size-4" />
                </Button>
              )
            })}
            <span className="bg-border mx-1 h-5 w-px" />
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
            <span className="bg-border mx-1 h-5 w-px" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive size-7"
              title={TIPTAP_NS.figure.remove}
              onClick={() => deleteNode()}
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      {editable ? (
        <figcaption contentEditable={false}>
          <input
            type="text"
            className="rt-caption-input"
            value={caption}
            placeholder={TIPTAP_NS.figure.captionPlaceholder}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </figcaption>
      ) : caption ? (
        <figcaption>{caption}</figcaption>
      ) : null}
    </NodeViewWrapper>
  )
}
