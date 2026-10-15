"use client"

import { useRef, useState } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import {
  ArrowsUpDownIcon,
  ArrowUturnLeftIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

import {
  FIGURE_WIDTHS,
  type FigureWidth,
  type FloatPos,
} from "@/components/shared/tiptap-rich-nodes"
import { ImageInsertDialog } from "@/components/shared/tiptap-toolbar-rich"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { cn } from "@/lib/utils"

/**
 * Editor view for {@link ImageFloat} — Word's free placement. The node's own
 * DOM is a zero-height anchor; the picture (`rt-float`) and its controls
 * (`rt-float-ui`) are absolutely positioned siblings anchored to the prose
 * container, exactly like a floating object on a Word page.
 *
 * - `pos="front"` — picture paints over the text and is dragged anywhere by
 *   grabbing it (pointer drag, committed to `x`/`y` on release).
 * - `pos="behind"` — picture paints under the text (`z-index:-1`, so it can't
 *   be clicked directly); the little anchor chip that always sits on its top
 *   corner selects it and drags it, mirroring Word's anchor icon.
 */
export function ImageFloatView({
  node,
  selected,
  updateAttributes,
  deleteNode,
  editor,
  getPos,
}: NodeViewProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const floatRef = useRef<HTMLDivElement>(null)
  const uiRef = useRef<HTMLDivElement>(null)
  const src = (node.attrs.src as string | null) ?? ""
  const alt = (node.attrs.alt as string) ?? ""
  const caption = (node.attrs.caption as string) ?? ""
  const pos = (node.attrs.pos as FloatPos) ?? "front"
  const width = (node.attrs.width as FigureWidth) ?? 50
  const x = (node.attrs.x as number) ?? 0
  const y = (node.attrs.y as number) ?? 0
  const editable = editor.isEditable

  const select = () => {
    const p = getPos()
    if (p != null) editor.commands.setNodeSelection(p)
  }

  /** Pointer drag — moves the picture freely, like Word. The DOM is moved
   * live for smoothness and the final position commits on release; a press
   * that never moved is treated as a click and selects the node. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (!editable || e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest("button, select, input, a")) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const ox = x
    const oy = y
    let moved = false
    let last = { x: ox, y: oy }
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return
      moved = true
      const cw = editor.view.dom.clientWidth || 800
      last = {
        x: Math.min(Math.max(0, ox + dx), Math.max(0, cw - 40)),
        y: Math.max(0, oy + dy),
      }
      if (floatRef.current) {
        floatRef.current.style.left = `${last.x}px`
        floatRef.current.style.top = `${last.y}px`
      }
      if (uiRef.current) {
        uiRef.current.style.left = `${last.x}px`
        uiRef.current.style.top = `${last.y}px`
        // No room above the picture near the page top — flip the bar in.
        uiRef.current.style.translate = last.y < 40 ? "0 0" : "0 -100%"
      }
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      if (moved) {
        updateAttributes(last)
      } else {
        select()
      }
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up, { once: true })
  }

  return (
    <NodeViewWrapper className="rt-float-anchor" data-pos={pos}>
      <div
        ref={floatRef}
        className={cn(
          "rt-float",
          selected && editable && "rt-figure-selected",
        )}
        data-pos={pos}
        data-width={width}
        data-x={x}
        data-y={y}
        style={{ left: x, top: y, width: `${width}%` }}
        contentEditable={false}
        onPointerDown={pos === "front" && editable ? onPointerDown : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </div>
      {editable ? (
        <div
          ref={uiRef}
          className="rt-float-ui border-border bg-popover text-popover-foreground rounded-md border shadow-md"
          style={{ left: x, top: y, translate: y < 40 ? "0 0" : "0 -100%" }}
          contentEditable={false}
          dir="rtl"
        >
          <span
            title={TIPTAP_NS.figure.freeDrag}
            aria-label={TIPTAP_NS.figure.freeDrag}
            className="hover:bg-accent flex size-7 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
            onPointerDown={onPointerDown}
          >
            <ArrowsUpDownIcon className="size-4" />
          </span>
          {selected ? (
            <>
              <span className="bg-border mx-0.5 h-5 w-px self-center" />
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
                title={TIPTAP_NS.figure.unfloat}
                aria-label={TIPTAP_NS.figure.unfloat}
                className="hover:bg-accent flex size-7 items-center justify-center rounded-md"
                onClick={() => editor.chain().focus().unsetImageFloat().run()}
              >
                <ArrowUturnLeftIcon className="size-4" />
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
            </>
          ) : null}
        </div>
      ) : null}
      {editable ? (
        <ImageInsertDialog
          editor={editor}
          open={moreOpen}
          onOpenChange={setMoreOpen}
          initial={{ src, alt, caption, width }}
          onApply={(attrs) =>
            updateAttributes({
              src: attrs.src,
              alt: attrs.alt,
              caption: attrs.caption,
              width: attrs.width,
            })
          }
        />
      ) : null}
    </NodeViewWrapper>
  )
}
