"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { marked } from "marked"

import { tiptapContentType } from "@/components/shared/tiptap-content"
import { getEditorMarkdown } from "@/components/shared/tiptap-markdown"
import { createTiptapExtensions } from "@/components/shared/tiptap-extensions"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
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

type EditorMode = "edit" | "preview" | "markdown" | "html"
type SourceMode = "markdown" | "html"

const EDITABLE_MODES: EditorMode[] = ["edit", "preview", "markdown", "html"]
const VIEWER_MODES: EditorMode[] = ["preview", "markdown", "html"]

function langToDir(lang?: "CKB" | "KMR"): "rtl" | "ltr" {
  return lang === "KMR" ? "ltr" : "rtl"
}

/**
 * Re-seed a source pane straight from an incoming `value`, without reading the
 * editor doc (which may lag a render behind). Matching formats pass through
 * untouched; a Markdown payload shown in the HTML pane is converted with
 * `marked`, and an HTML payload shown in the Markdown pane is shown as stored
 * (there is no HTML→Markdown serializer in the bundle — the raw source is
 * still content-accurate and edits round-trip through `tiptapContentType`).
 */
function seedFromValue(mode: SourceMode, incoming: string): string {
  if (!incoming) return ""
  const type = tiptapContentType(incoming)
  if (mode === "markdown") return incoming
  if (type === "html") return incoming
  return marked.parse(incoming, { async: false, gfm: true })
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
  const [mode, setMode] = useState<EditorMode>(editable ? "edit" : "preview")
  /** Draft of the open source pane. `emitted` marks text the user just typed
   * there (vs. a seed), so an incoming `value` equal to it is recognized as
   * this pane's own echo rather than an external change. */
  const [sourceEdit, setSourceEdit] = useState<{
    mode: SourceMode
    text: string
    emitted: boolean
  } | null>(null)
  const [appliedValue, setAppliedValue] = useState(value)
  const dir = langToDir(lang)
  // A viewer can never land in "edit" even if `editable` flips after mount.
  const activeMode: EditorMode =
    !editable && mode === "edit" ? "preview" : mode
  const isEditing = editable && activeMode === "edit"
  const isSourceMode = activeMode === "markdown" || activeMode === "html"
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

  const isOwnSourceEcho =
    isSourceMode &&
    sourceEdit?.mode === activeMode &&
    sourceEdit.emitted &&
    sourceEdit.text === (value ?? "")

  // `value` changed: re-seed an open source pane — unless the pane itself
  // emitted this value, in which case the draft is already correct and
  // rewriting it would steal the caret.
  if (appliedValue !== value) {
    setAppliedValue(value)
    if (isSourceMode && !isOwnSourceEcho) {
      const m = activeMode as SourceMode
      setSourceEdit({ mode: m, text: seedFromValue(m, value ?? ""), emitted: false })
    }
  }

  function switchMode(next: EditorMode) {
    if (!editor || editor.isDestroyed) {
      setMode(next)
      return
    }
    // Leaving a source pane: make sure the doc holds exactly what the user
    // typed, even if `onChange` plumbing did not round-trip the value back.
    if (
      (mode === "markdown" || mode === "html") &&
      sourceEdit?.mode === mode
    ) {
      editor.commands.setContent(sourceEdit.text, {
        emitUpdate: false,
        contentType: tiptapContentType(sourceEdit.text),
      })
    }
    if (next === "markdown") {
      setSourceEdit({
        mode: "markdown",
        text: getEditorMarkdown(editor),
        emitted: false,
      })
    } else if (next === "html") {
      setSourceEdit({ mode: "html", text: editor.getHTML(), emitted: false })
    }
    setMode(next)
  }

  function handleSourceChange(text: string) {
    if (!isSourceMode) return
    setSourceEdit({ mode: activeMode as SourceMode, text, emitted: true })
    onChange?.(text)
  }

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const incoming = value ?? ""
    // Emitted by the open source pane — the doc is flushed back on mode exit,
    // so skip the per-keystroke re-parse.
    if (
      isSourceMode &&
      sourceEdit?.mode === activeMode &&
      sourceEdit.emitted &&
      sourceEdit.text === incoming
    ) {
      return
    }
    if (incoming !== getEditorMarkdown(editor)) {
      editor.commands.setContent(incoming || "", {
        emitUpdate: false,
        contentType: tiptapContentType(incoming),
      })
    }
  }, [editor, value, activeMode, isSourceMode, sourceEdit])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(isEditing)
  }, [isEditing, editor])

  if (!editor) return null

  const modes = editable ? EDITABLE_MODES : VIEWER_MODES

  const editorChrome = (
    <div className="space-y-1.5">
      <div
        role="tablist"
        aria-label={TIPTAP_NS.modes.label}
        className="bg-muted inline-flex w-fit items-center gap-0.5 rounded-lg p-[3px]"
      >
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={activeMode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "text-foreground/60 hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all",
              activeMode === m &&
                "bg-background text-foreground shadow-sm dark:bg-input/30",
            )}
          >
            {TIPTAP_NS.modes[m]}
          </button>
        ))}
      </div>
      <div className={tiptapEditorShellClass(error)}>
        <div className="bg-background min-h-0 max-h-[480px] overflow-y-auto">
          {isEditing ? (
            <TiptapToolbar
              editor={editor}
              variant={toolbar}
              sticky={pinToolbar}
            />
          ) : null}
          <div className={cn(isSourceMode && "hidden")}>
            <EditorContent editor={editor} dir={dir} />
          </div>
          {isSourceMode ? (
            <textarea
              dir="ltr"
              value={sourceEdit?.mode === activeMode ? sourceEdit.text : ""}
              readOnly={!editable}
              spellCheck={false}
              onChange={(e) => handleSourceChange(e.target.value)}
              className={cn(
                "text-foreground min-h-[320px] w-full resize-y bg-transparent px-3 py-2 font-mono text-xs leading-relaxed outline-none",
                !editable && "cursor-default",
              )}
              aria-label={TIPTAP_NS.modes[activeMode]}
            />
          ) : null}
        </div>
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

export type TiptapViewerProps = {
  /** Stored Markdown (or legacy HTML). */
  html: string | null | undefined
  lang?: "CKB" | "KMR"
  contentMinHeightClass?: string
}

export function TiptapViewer({
  html: content,
  lang,
  contentMinHeightClass,
}: TiptapViewerProps) {
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
