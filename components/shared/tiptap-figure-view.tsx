"use client"

import { useState } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import {
  ArrowsUpDownIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import {
  FIGURE_WIDTHS,
  type FigureAlign,
  type FigureWidth,
} from "@/components/shared/tiptap-rich-nodes"
import { ImageInsertDialog } from "@/components/shared/tiptap-toolbar-rich"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { cn } from "@/lib/utils"

/** Order shown in the wrap grid — mirrors Word's "With Text Wrapping". */
const WRAP_OPTIONS: FigureAlign[] = ["left", "full", "right", "behind"]

/**
 * Small visual icon per placement, drawn like Word's layout glyphs: a blue
 * picture block plus grey text lines showing how the copy flows around it.
 */
function WrapIcon({ kind }: { kind: FigureAlign }) {
  const img = "fill-[#7ba7d9]"
  const line = "fill-current opacity-40"
  switch (kind) {
    case "center": // In line with text
      return (
        <svg viewBox="0 0 40 30" className="size-full" aria-hidden>
          <rect x="2" y="2" width="36" height="3" className={line} />
          <rect x="2" y="8" width="36" height="3" className={line} />
          <rect x="2" y="14" width="13" height="3" className={line} />
          <rect x="25" y="14" width="13" height="3" className={line} />
          <rect x="17" y="12" width="6" height="7" rx="1" className={img} />
          <rect x="2" y="21" width="36" height="3" className={line} />
          <rect x="2" y="26" width="36" height="3" className={line} />
        </svg>
      )
    case "left": // Square — picture left, text wraps the right side
      return (
        <svg viewBox="0 0 40 30" className="size-full" aria-hidden>
          <rect x="2" y="2" width="16" height="17" rx="1" className={img} />
          <rect x="21" y="2" width="17" height="3" className={line} />
          <rect x="21" y="8" width="17" height="3" className={line} />
          <rect x="21" y="14" width="17" height="3" className={line} />
          <rect x="2" y="22" width="36" height="3" className={line} />
          <rect x="2" y="27" width="36" height="3" className={line} />
        </svg>
      )
    case "right": // Square — picture right, text wraps the left side
      return (
        <svg viewBox="0 0 40 30" className="size-full" aria-hidden>
          <rect x="22" y="2" width="16" height="17" rx="1" className={img} />
          <rect x="2" y="2" width="17" height="3" className={line} />
          <rect x="2" y="8" width="17" height="3" className={line} />
          <rect x="2" y="14" width="17" height="3" className={line} />
          <rect x="2" y="22" width="36" height="3" className={line} />
          <rect x="2" y="27" width="36" height="3" className={line} />
        </svg>
      )
    case "full": // Top and bottom
      return (
        <svg viewBox="0 0 40 30" className="size-full" aria-hidden>
          <rect x="2" y="2" width="36" height="3" className={line} />
          <rect x="2" y="8" width="36" height="3" className={line} />
          <rect x="2" y="13" width="36" height="11" rx="1" className={img} />
          <rect x="2" y="26" width="36" height="3" className={line} />
        </svg>
      )
    case "behind": // Behind text — lines cross the picture
      return (
        <svg viewBox="0 0 40 30" className="size-full" aria-hidden>
          <rect x="6" y="3" width="28" height="24" rx="1" className={img} />
          <rect x="2" y="6" width="36" height="3" className={line} />
          <rect x="2" y="12" width="36" height="3" className={line} />
          <rect x="2" y="18" width="36" height="3" className={line} />
          <rect x="2" y="24" width="36" height="3" className={line} />
        </svg>
      )
  }
}

function OptionCell({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "hover:bg-accent flex flex-col items-center gap-0.5 rounded-md p-1.5 transition-colors",
        active && "bg-accent ring-ring ring-1",
      )}
    >
      <span className="text-foreground/70 block h-8 w-11">{children}</span>
    </button>
  )
}

/**
 * Word-style "Layout Options" popover for {@link ImageFigure}: hovering shows
 * the thin hover bar; selecting the figure opens the full panel — in-line vs.
 * text-wrapping icons, width, caption, drag grip, remove and "See more…"
 * (the full image dialog). Everything writes node attributes, so the stored
 * HTML stays the single source of truth.
 */
export function ImageFigureView({
  node,
  selected,
  updateAttributes,
  deleteNode,
  editor,
  getPos,
}: NodeViewProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const src = (node.attrs.src as string | null) ?? ""
  const alt = (node.attrs.alt as string) ?? ""
  const caption = (node.attrs.caption as string) ?? ""
  const align = (node.attrs.align as FigureAlign) ?? "center"
  const width = (node.attrs.width as FigureWidth) ?? 100
  const editable = editor.isEditable

  const grip = (
    <span
      data-drag-handle
      title={TIPTAP_NS.figure.drag}
      aria-label={TIPTAP_NS.figure.drag}
      className="hover:bg-accent flex size-7 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
    >
      <ArrowsUpDownIcon className="size-4" />
    </span>
  )
  const widthSelect = (
    <select
      className="bg-background h-7 rounded border px-1 text-xs"
      value={width}
      title={TIPTAP_NS.figure.width}
      onChange={(e) => updateAttributes({ width: Number(e.target.value) })}
    >
      {FIGURE_WIDTHS.map((w) => (
        <option key={w} value={w}>
          {w}%
        </option>
      ))}
    </select>
  )
  const removeBtn = (
    <button
      type="button"
      title={TIPTAP_NS.figure.remove}
      aria-label={TIPTAP_NS.figure.remove}
      onClick={() => deleteNode()}
      className="text-destructive hover:bg-accent flex size-7 items-center justify-center rounded-md"
    >
      <TrashIcon className="size-4" />
    </button>
  )

  return (
    <NodeViewWrapper
      as="figure"
      className={cn(
        "rt-figure",
        selected && editable && "rt-figure-selected",
      )}
      data-align={align}
      data-width={width}
      draggable
    >
      {/* Dragging starts from the grip only (data-drag-handle there), so a
          plain click on the image reliably selects the node — which is what
          opens the layout panel. The explicit onClick is belt-and-suspenders
          for the same guarantee. */}
      <div
        contentEditable={false}
        className="rt-figure-media"
        onClick={(e) => {
          // Clicks on the bar/panel/inputs keep their own behaviour — only a
          // click on the image itself (re)selects the node.
          const target = e.target as HTMLElement
          if (target.closest(".rt-figure-bar, .rt-figure-panel, input, select, button, a")) {
            return
          }
          const pos = getPos()
          if (pos != null) editor.commands.setNodeSelection(pos)
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
        {editable ? (
          <>
            {/* Hover bar — thin strip while the pointer is over the image. */}
            <div
              className="rt-figure-bar border-border bg-popover text-popover-foreground flex items-center gap-0.5 rounded-md border p-1 shadow-md"
              dir="rtl"
            >
              {grip}
              <span className="bg-border mx-0.5 h-5 w-px" />
              {widthSelect}
              {removeBtn}
              <button
                type="button"
                title={TIPTAP_NS.figure.align}
                aria-label={TIPTAP_NS.figure.align}
                className="hover:bg-accent flex size-7 items-center justify-center rounded-md"
                onClick={() => {
                  const pos = getPos()
                  if (pos != null) editor.commands.setNodeSelection(pos)
                }}
              >
                <PhotoIcon className="size-4" />
              </button>
            </div>

            {/* Layout panel — shown while the figure is selected. */}
            <div className="rt-figure-panel border-border bg-popover text-popover-foreground w-64 rounded-lg border p-2.5 shadow-xl">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-foreground px-0.5 text-xs font-semibold">
                  {TIPTAP_NS.figure.align}
                </span>
                <button
                  type="button"
                  title={TIPTAP_NS.figure.cancel}
                  aria-label={TIPTAP_NS.figure.cancel}
                  className="hover:bg-accent flex size-6 items-center justify-center rounded-md"
                  onClick={() => {
                    const pos = getPos()
                    if (pos != null) {
                      editor.commands.setTextSelection(pos + node.nodeSize)
                    }
                  }}
                >
                  <XMarkIcon className="size-3.5" />
                </button>
              </div>

              <p className="text-muted-foreground px-0.5 text-[11px]">
                {TIPTAP_NS.figure.inLine}
              </p>
              <div className="mb-1 flex">
                <OptionCell
                  label={TIPTAP_NS.figure.alignLabel.center}
                  active={align === "center"}
                  onClick={() => updateAttributes({ align: "center" })}
                >
                  <WrapIcon kind="center" />
                </OptionCell>
              </div>

              <p className="text-muted-foreground px-0.5 text-[11px]">
                {TIPTAP_NS.figure.wrapping}
              </p>
              <div className="mb-1.5 flex gap-0.5">
                {WRAP_OPTIONS.map((value) => (
                  <OptionCell
                    key={value}
                    label={TIPTAP_NS.figure.alignLabel[value]}
                    active={align === value}
                    onClick={() => updateAttributes({ align: value })}
                  >
                    <WrapIcon kind={value} />
                  </OptionCell>
                ))}
              </div>

              <div className="border-border flex items-center gap-1 border-t pt-1.5">
                {grip}
                {widthSelect}
                <button
                  type="button"
                  className="hover:bg-accent ms-auto h-7 rounded-md px-2 text-xs"
                  onClick={() => setMoreOpen(true)}
                >
                  {TIPTAP_NS.figure.seeMore}
                </button>
                {removeBtn}
              </div>
            </div>
          </>
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
      {editable ? (
        <ImageInsertDialog
          editor={editor}
          open={moreOpen}
          onOpenChange={setMoreOpen}
          initial={{ src, alt, caption, align, width }}
          onApply={(attrs) => updateAttributes(attrs)}
        />
      ) : null}
    </NodeViewWrapper>
  )
}
