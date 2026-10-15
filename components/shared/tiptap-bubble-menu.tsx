"use client"

import type { ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  BackspaceIcon,
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  PaintBrushIcon,
  StrikethroughIcon,
  SwatchIcon,
  UnderlineIcon,
} from "@heroicons/react/24/outline"

import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import {
  ColorPicker,
  FontFamilySelect,
  FontSizeSelect,
} from "@/components/shared/tiptap-toolbar-rich"
import {
  TABLE_STYLES,
  type TableStyle,
} from "@/components/shared/tiptap-rich-nodes"
import { cn } from "@/lib/utils"

const bubbleClass =
  "border-border bg-popover text-popover-foreground flex items-center gap-0.5 rounded-lg border p-1 shadow-lg"

const bubbleOptions = {
  strategy: "fixed",
  placement: "top",
  offset: 8,
  flip: true,
  shift: true,
} as const

/** The scrollable editor shell would clip an absolutely-positioned menu. */
const appendToBody = () =>
  (typeof document !== "undefined" ? document.body : null) as HTMLElement

function BubbleBtn({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed ?? undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-40",
        pressed && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  )
}

function promptLink(editor: Editor) {
  const prev = editor.getAttributes("link").href as string | undefined
  const next =
    typeof window !== "undefined"
      ? window.prompt(TIPTAP_NS.prompt.link, prev ?? "")
      : null
  if (next === null) return
  if (!next.trim()) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run()
}

/**
 * Word-style floating mini toolbars:
 *  - selecting text pops a compact bar with font, size, color, highlight and
 *    the inline marks — no trip up to the main toolbar;
 *  - placing the caret inside a table pops the table-format bar (style
 *    presets + cell background) so the table options are right at the table.
 * Both are editor-only chrome — nothing here touches the stored HTML.
 */
export function TiptapBubbleMenus({ editor }: { editor: Editor }) {
  const textColor = editor.getAttributes("textStyle").color as
    | string
    | undefined
  const highlightColor = editor.getAttributes("highlight").color as
    | string
    | undefined
  const cellColor = (editor.getAttributes("tableCell").backgroundColor ??
    editor.getAttributes("tableHeader").backgroundColor) as string | undefined
  const tableStyle =
    (editor.getAttributes("table").tableStyle as TableStyle | undefined) ??
    "grid"

  return (
    <>
      {/* Text selection — font, size, marks, colors. */}
      <BubbleMenu
        editor={editor}
        pluginKey="textBubble"
        appendTo={appendToBody}
        options={bubbleOptions}
        shouldShow={({ editor: ed, state, from, to }) => {
          if (!ed.isEditable || from === to) return false
          // Atom node selections (figures, videos…) get their own controls.
          if (state.selection.toJSON().type !== "text") return false
          return true
        }}
      >
        <div className={bubbleClass} dir="rtl">
          <FontFamilySelect editor={editor} />
          <FontSizeSelect editor={editor} />
          <span className="bg-border mx-0.5 h-5 w-px" />
          <BubbleBtn
            label={TIPTAP_NS.toolbar.bold}
            pressed={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-4" />
          </BubbleBtn>
          <BubbleBtn
            label={TIPTAP_NS.toolbar.italic}
            pressed={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-4" />
          </BubbleBtn>
          <BubbleBtn
            label={TIPTAP_NS.toolbar.underline}
            pressed={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </BubbleBtn>
          <BubbleBtn
            label={TIPTAP_NS.toolbar.strike}
            pressed={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon className="size-4" />
          </BubbleBtn>
          <ColorPicker
            label={TIPTAP_NS.toolbar.textColor}
            value={textColor}
            onPick={(c) => editor.chain().focus().setColor(c).run()}
            onClear={() => editor.chain().focus().unsetColor().run()}
          >
            <SwatchIcon className="size-4" />
          </ColorPicker>
          <ColorPicker
            label={TIPTAP_NS.toolbar.highlight}
            value={highlightColor}
            onPick={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
            onClear={() => editor.chain().focus().unsetHighlight().run()}
          >
            <PaintBrushIcon className="size-4" />
          </ColorPicker>
          <BubbleBtn
            label={TIPTAP_NS.toolbar.link}
            pressed={editor.isActive("link")}
            onClick={() => promptLink(editor)}
          >
            <LinkIcon className="size-4 rtl:rotate-180" />
          </BubbleBtn>
          <BubbleBtn
            label={TIPTAP_NS.toolbar.clearFormatting}
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          >
            <BackspaceIcon className="size-4 rtl:rotate-180" />
          </BubbleBtn>
        </div>
      </BubbleMenu>

      {/* Table context — style preset + cell background at the caret. */}
      <BubbleMenu
        editor={editor}
        pluginKey="tableBubble"
        appendTo={appendToBody}
        options={bubbleOptions}
        shouldShow={({ editor: ed, state }) => {
          if (!ed.isEditable || !ed.isActive("table")) return false
          // A text selection gets the text bar instead.
          return state.selection.empty
        }}
      >
        <div className={bubbleClass} dir="rtl">
          <span className="text-muted-foreground px-1 text-xs">
            {TIPTAP_NS.table.style}
          </span>
          {TABLE_STYLES.map((s) => (
            <BubbleBtn
              key={s}
              label={TIPTAP_NS.table.styleLabel[s]}
              pressed={tableStyle === s}
              onClick={() => editor.chain().focus().setTableStyle(s).run()}
            >
              <span className="px-1 text-xs whitespace-nowrap">
                {TIPTAP_NS.table.styleLabel[s]}
              </span>
            </BubbleBtn>
          ))}
          <span className="bg-border mx-0.5 h-5 w-px" />
          <ColorPicker
            label={TIPTAP_NS.table.cellColor}
            value={cellColor}
            onPick={(c) => editor.chain().focus().setCellBackground(c).run()}
            onClear={() => editor.chain().focus().setCellBackground(null).run()}
          >
            <SwatchIcon className="size-4 opacity-70" />
          </ColorPicker>
          <BubbleBtn
            label={TIPTAP_NS.table.delete}
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <BackspaceIcon className="size-4 text-destructive rtl:rotate-180" />
          </BubbleBtn>
        </div>
      </BubbleMenu>
    </>
  )
}
