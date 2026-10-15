"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { EyeIcon } from "@heroicons/react/24/outline"
import { marked } from "marked"

import { tiptapContentType } from "@/components/shared/tiptap-content"
import {
  getEditorHtml,
  getEditorMarkdown,
} from "@/components/shared/tiptap-markdown"
import { SiteFontFaces } from "@/components/shared/site-font-faces"
import { createTiptapExtensions } from "@/components/shared/tiptap-extensions"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { TiptapToolbar } from "@/components/shared/tiptap-toolbar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export type TiptapEditorProps = {
  value: string
  /** Receives the document as HTML (legacy values may still be Markdown). */
  onChange?: (html: string) => void
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
  /**
   * Show the preview-in-modal button (default true). Disabled inside the
   * preview modal itself so the nested viewer cannot spawn another modal.
   */
  previewModal?: boolean
  /** Owning entity for the R2 folder layout ("news" → news/images/…). */
  entity?: string
  className?: string
}

type EditorMode = "edit" | "preview" | "markdown" | "html"
type SourceMode = "markdown" | "html"
type PreviewPane = "preview" | "markdown" | "html"

const EDITABLE_MODES: EditorMode[] = ["edit", "markdown", "html"]
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

/** Read-only document body for the preview modal — no editor chrome. */
function PreviewDocument({
  content,
  lang,
}: {
  content: string
  lang?: "CKB" | "KMR"
}) {
  const editor = useEditor({
    extensions: createTiptapExtensions({ editable: false }),
    editable: false,
    content,
    contentType: tiptapContentType(content),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm md:prose-base max-w-none dark:prose-invert outline-none prose-img:rounded-lg",
      },
    },
  })

  if (!editor) return null
  return <EditorContent editor={editor} dir={langToDir(lang)} />
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
  previewModal = true,
  entity,
  className,
}: TiptapEditorProps) {
  const [mode, setMode] = useState<EditorMode>(editable ? "edit" : "preview")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<{
    html: string
    markdown: string
  }>({ html: "", markdown: "" })
  const [previewPane, setPreviewPane] = useState<PreviewPane>("preview")
  /** Draft of the open source pane. `emitted` marks text the user just typed
   * there (vs. a seed), so an incoming `value` equal to it is recognized as
   * this pane's own echo rather than an external change. `seed` is the text
   * the pane opened with — if it is unchanged on exit the doc is left alone,
   * so a lossy Markdown view never overwrites rich formatting. */
  const [sourceEdit, setSourceEdit] = useState<{
    mode: SourceMode
    text: string
    seed: string
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
      onChange?.(getEditorHtml(ed))
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
      const seed = seedFromValue(m, value ?? "")
      setSourceEdit({ mode: m, text: seed, seed, emitted: false })
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
      sourceEdit?.mode === mode &&
      sourceEdit.text !== sourceEdit.seed
    ) {
      editor.commands.setContent(sourceEdit.text, {
        emitUpdate: false,
        contentType: tiptapContentType(sourceEdit.text),
      })
      onChange?.(getEditorHtml(editor))
    }
    if (next === "markdown") {
      const seed = getEditorMarkdown(editor)
      setSourceEdit({ mode: "markdown", text: seed, seed, emitted: false })
    } else if (next === "html") {
      const seed = getEditorHtml(editor)
      setSourceEdit({ mode: "html", text: seed, seed, emitted: false })
    }
    setMode(next)
  }

  function openPreview() {
    // Snapshot the live doc — unsaved edits and media nodes included — even
    // when `onChange` has not round-tripped the value back to the form.
    setPreviewContent(
      editor && !editor.isDestroyed
        ? { html: getEditorHtml(editor), markdown: getEditorMarkdown(editor) }
        : { html: value ?? "", markdown: value ?? "" },
    )
    setPreviewPane("preview")
    setPreviewOpen(true)
  }

  function handleSourceChange(text: string) {
    if (!isSourceMode) return
    setSourceEdit((prev) => ({
      mode: activeMode as SourceMode,
      text,
      seed: prev?.mode === activeMode ? prev.seed : "",
      emitted: true,
    }))
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
    if (incoming !== getEditorHtml(editor)) {
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
      <SiteFontFaces />
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
        {previewModal ? (
          <button
            type="button"
            onClick={openPreview}
            title={TIPTAP_NS.modes.preview}
            className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all"
          >
            <EyeIcon className="size-3.5" />
            {editable ? TIPTAP_NS.modes.preview : TIPTAP_NS.modes.expand}
          </button>
        ) : null}
      </div>
      <div className={tiptapEditorShellClass(error)}>
        <div className="bg-background min-h-0 max-h-[480px] overflow-y-auto">
          {isEditing ? (
            <TiptapToolbar
              editor={editor}
              variant={toolbar}
              sticky={pinToolbar}
              entity={entity}
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
      {previewModal ? (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent
            dir={dir}
            className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          >
            <DialogHeader className="shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b px-4 py-3 pe-12">
              <DialogTitle>{TIPTAP_NS.modes.preview}</DialogTitle>
              <div
                role="tablist"
                aria-label={TIPTAP_NS.modes.label}
                className="bg-muted inline-flex w-fit items-center gap-0.5 rounded-lg p-[3px]"
              >
                {(["preview", "markdown", "html"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={previewPane === m}
                    onClick={() => setPreviewPane(m)}
                    className={cn(
                      "text-foreground/60 hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all",
                      previewPane === m &&
                        "bg-background text-foreground shadow-sm dark:bg-input/30",
                    )}
                  >
                    {TIPTAP_NS.modes[m]}
                  </button>
                ))}
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {!previewContent.html.trim() ? (
                <p className="text-muted-foreground text-sm">
                  {TIPTAP_NS.modes.empty}
                </p>
              ) : previewPane === "preview" ? (
                <PreviewDocument content={previewContent.html} lang={lang} />
              ) : (
                <pre
                  dir="ltr"
                  className="bg-muted/50 overflow-x-auto rounded-lg p-4 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap"
                >
                  {previewPane === "markdown"
                    ? previewContent.markdown
                    : previewContent.html}
                </pre>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
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
  /** Stored HTML (or legacy Markdown). */
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
