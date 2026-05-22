"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import { tiptapContentType } from "@/components/shared/tiptap-content"
import { getEditorMarkdown } from "@/components/shared/tiptap-markdown"
import { createTiptapExtensions } from "@/components/shared/tiptap-extensions"
import { TiptapToolbar } from "@/components/shared/tiptap-toolbar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export type TiptapEditorProps = {
  value: string
  onChange?: (markdown: string) => void
  editable?: boolean
  label?: string
  error?: string | null | boolean
  placeholder?: string
  /** CKB → rtl, KMR → ltr */
  lang?: "CKB" | "KMR"
  contentMinHeightClass?: string
  toolbar?: "full" | "compact"
  /**
   * @deprecated Use `stickyToolbar` — all editors use the bordered shell (news style).
   * `sticky` only keeps the toolbar pinned while scrolling.
   */
  layout?: "bordered" | "sticky"
  /** Pin toolbar inside the bordered editor while scrolling (former `layout="sticky"`). */
  stickyToolbar?: boolean
  className?: string
}

function langToDir(lang?: "CKB" | "KMR"): "rtl" | "ltr" {
  return lang === "KMR" ? "ltr" : "rtl"
}

/** Shadcn input/textarea shell — matches news editor and `components/ui/textarea`. */
export function tiptapEditorShellClass(error?: string | null | boolean) {
  return cn(
    "border-input rounded-lg border bg-popover outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 overflow-hidden dark:bg-input/30",
    error &&
      "border-destructive ring-destructive/40 focus-within:border-destructive focus-within:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
  )
}

export function TiptapEditor({
  value,
  onChange,
  editable = true,
  label,
  error,
  placeholder,
  lang,
  contentMinHeightClass,
  toolbar = "full",
  layout = "bordered",
  stickyToolbar,
  className,
}: TiptapEditorProps) {
  const [preview, setPreview] = useState(false)
  const dir = langToDir(lang)
  const isEditing = editable && !preview
  const pinToolbar = stickyToolbar ?? layout === "sticky"

  const defaultMinHeight = isEditing ? "min-h-[320px]" : "min-h-36"

  const editor = useEditor({
    extensions: createTiptapExtensions({
      editable: isEditing,
      placeholder: isEditing ? placeholder : undefined,
    }),
    editable: isEditing,
    content: value || "",
    contentType: tiptapContentType(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm md:prose-base max-w-none dark:prose-invert px-3 py-2 outline-none",
          contentMinHeightClass ?? defaultMinHeight,
          "bg-transparent rounded-none",
          !isEditing && "prose-img:rounded-md",
        ),
      },
    },
    onUpdate({ editor: ed }) {
      onChange?.(getEditorMarkdown(ed))
    },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const cur = getEditorMarkdown(editor)
    const incoming = value ?? ""
    if (incoming !== cur) {
      editor.commands.setContent(incoming || "", {
        emitUpdate: false,
        contentType: tiptapContentType(incoming),
      })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(isEditing)
  }, [isEditing, editor])

  if (!editor) return null

  const showToolbar = editable && (isEditing || preview)

  const editorChrome = (
    <div className={tiptapEditorShellClass(error)}>
      {showToolbar ? (
        <TiptapToolbar
          editor={editor}
          variant={toolbar}
          preview={preview}
          onPreviewToggle={
            toolbar === "full" ? () => setPreview((p) => !p) : undefined
          }
          sticky={pinToolbar}
        />
      ) : null}
      <div className="bg-background min-h-0">
        <EditorContent editor={editor} dir={dir} />
      </div>
    </div>
  )

  if (label || (error && typeof error === "string")) {
    return (
      <Field data-invalid={error ? "" : undefined} className={className}>
        {label ? (
          <FieldLabel className="text-sm font-semibold">{label}</FieldLabel>
        ) : null}
        {editorChrome}
        {error && typeof error === "string" ? (
          <FieldError className="text-xs">{error}</FieldError>
        ) : null}
      </Field>
    )
  }

  return <div className={className}>{editorChrome}</div>
}

export function TiptapViewer({
  html: content,
  lang,
  contentMinHeightClass,
}: {
  /** Stored Markdown (or legacy HTML). */
  html: string | null | undefined
  lang?: "CKB" | "KMR"
  contentMinHeightClass?: string
}) {
  return (
    <TiptapEditor
      editable={false}
      value={content ?? ""}
      lang={lang}
      contentMinHeightClass={contentMinHeightClass}
      layout="bordered"
    />
  )
}
