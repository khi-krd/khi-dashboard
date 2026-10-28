"use client"

import { useRef, useState, type ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import {
  ArrowUpTrayIcon,
  ChevronDownIcon,
  MusicalNoteIcon,
  PhotoIcon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline"

import {
  FIGURE_ALIGNS,
  FIGURE_WIDTHS,
  TABLE_STYLES,
  type FigureAlign,
  type FigureWidth,
  type TableStyle,
} from "@/components/shared/tiptap-rich-nodes"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { useSiteFontFamilies } from "@/components/shared/site-font-faces"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { extractIframeSrc, toAudioEmbedUrl } from "@/lib/embed-url"
import { uploadMedia } from "@/services/mediaService"
import { cn } from "@/lib/utils"
import { toastApiError } from "@/lib/toast"

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

const selectClass =
  "border-input bg-background hover:bg-accent h-8 max-w-[9.5rem] shrink-0 rounded-md border px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

function ToolbarTrigger({
  label,
  pressed,
  children,
  className,
}: {
  label: string
  pressed?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn("h-8 shrink-0 gap-0.5 rounded-md px-1.5", className)}
                aria-pressed={pressed ?? undefined}
              />
            }
          />
        }
      >
        {children}
        <ChevronDownIcon className="size-3 opacity-60" />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/* Font family / size                                                  */
/* ------------------------------------------------------------------ */

function normalizeFamily(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.replace(/^["']|["']$/g, "").trim()
}

export function FontFamilySelect({ editor }: { editor: Editor }) {
  const families = useSiteFontFamilies()
  const current = normalizeFamily(editor.getAttributes("textStyle").fontFamily)
  const known = families.some((f) => f.family === current)

  return (
    <select
      className={selectClass}
      title={TIPTAP_NS.toolbar.fontFamily}
      aria-label={TIPTAP_NS.toolbar.fontFamily}
      value={known ? current : current ? "__custom" : ""}
      style={known ? { fontFamily: `"${current}"` } : undefined}
      onChange={(e) => {
        const family = e.target.value
        if (!family) editor.chain().focus().unsetFontFamily().run()
        else if (family !== "__custom")
          editor.chain().focus().setFontFamily(`"${family}"`).run()
      }}
    >
      <option value="">{TIPTAP_NS.toolbar.fontDefault}</option>
      {!known && current ? <option value="__custom">{current}</option> : null}
      {families.map((f) => (
        <option
          key={f.family}
          value={f.family}
          style={{ fontFamily: `"${f.family}"` }}
        >
          {f.family} · {f.lang}
        </option>
      ))}
    </select>
  )
}

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64]

export function FontSizeSelect({ editor }: { editor: Editor }) {
  const raw = editor.getAttributes("textStyle").fontSize as string | undefined
  const current = raw ? String(parseInt(raw, 10) || "") : ""
  const known = FONT_SIZES.includes(Number(current))

  return (
    <select
      className={cn(selectClass, "w-[4.75rem]")}
      title={TIPTAP_NS.toolbar.fontSize}
      aria-label={TIPTAP_NS.toolbar.fontSize}
      value={known ? current : current ? "__custom" : ""}
      onChange={(e) => {
        const size = e.target.value
        if (!size) editor.chain().focus().unsetFontSize().run()
        else if (size !== "__custom")
          editor.chain().focus().setFontSize(`${size}px`).run()
      }}
    >
      <option value="">{TIPTAP_NS.toolbar.fontSizeDefault}</option>
      {!known && current ? (
        <option value="__custom">{current}px</option>
      ) : null}
      {FONT_SIZES.map((s) => (
        <option key={s} value={s}>
          {s}px
        </option>
      ))}
    </select>
  )
}

/* ------------------------------------------------------------------ */
/* Color picker (text color, highlight, cell background)              */
/* ------------------------------------------------------------------ */

const PALETTE = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#ffffff",
  "#8c1515",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#fedd00",
  "#65a30d",
  "#16a34a",
  "#0d9488",
  "#0284c7",
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#db2777",
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#fbcfe8",
  "#e5e7eb",
  "#fef3c7",
]

export function ColorPicker({
  label,
  value,
  onPick,
  onClear,
  children,
  disabled,
}: {
  label: string
  value?: string | null
  onPick: (color: string) => void
  onClear: () => void
  children: ReactNode
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="relative size-8 shrink-0 rounded-md"
                  disabled={disabled}
                />
              }
            />
          }
        >
          {children}
          <span
            aria-hidden
            className="absolute inset-x-1.5 bottom-1 h-[3px] rounded-full"
            style={{ backgroundColor: value || "transparent" }}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-56 space-y-2 p-2" dir="rtl">
        <div className="grid grid-cols-8 gap-1">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "size-5 rounded-sm border border-black/10 ring-offset-1",
                value?.toLowerCase() === c && "ring-ring ring-2",
              )}
              style={{ backgroundColor: c }}
              title={c}
              onClick={() => {
                onPick(c)
                setOpen(false)
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground flex flex-1 items-center gap-2 text-xs">
            <input
              type="color"
              className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
              value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
              onChange={(e) => onPick(e.target.value)}
            />
            {TIPTAP_NS.color.custom}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              onClear()
              setOpen(false)
            }}
          >
            {TIPTAP_NS.color.none}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/* Image dialog — upload or link, alt, caption, placement, width       */
/* ------------------------------------------------------------------ */

export type ImageFigureValues = {
  src: string
  alt: string
  caption: string
  align: FigureAlign
  width: FigureWidth
}

export function ImageInsertDialog({
  editor,
  entity,
  open,
  onOpenChange,
  initial,
  onApply,
}: {
  editor: Editor
  entity?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit mode: seed the fields from an existing figure. */
  initial?: Partial<ImageFigureValues>
  /** Edit mode: apply back onto the selected node instead of inserting. */
  onApply?: (values: ImageFigureValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {onApply ? TIPTAP_NS.figure.editTitle : TIPTAP_NS.figure.title}
          </DialogTitle>
        </DialogHeader>
        {open ? (
          // Mounts fresh on every open — fields seed from `initial` and a
          // closed dialog can never hold stale values.
          <ImageInsertBody
            editor={editor}
            entity={entity}
            initial={initial}
            onApply={onApply}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ImageInsertBody({
  editor,
  entity,
  initial,
  onApply,
  onDone,
}: {
  editor: Editor
  entity?: string
  initial?: Partial<ImageFigureValues>
  onApply?: (values: ImageFigureValues) => void
  onDone: () => void
}) {
  const [src, setSrc] = useState(initial?.src ?? "")
  const [alt, setAlt] = useState(initial?.alt ?? "")
  const [caption, setCaption] = useState(initial?.caption ?? "")
  const [align, setAlign] = useState<FigureAlign>(initial?.align ?? "center")
  const [width, setWidth] = useState<FigureWidth>(initial?.width ?? 100)
  const [progress, setProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setProgress(0)
    try {
      const result = await uploadMedia(file, entity ?? "image", setProgress)
      setSrc(result.fileUrl)
    } catch (err) {
      toastApiError(err, TIPTAP_NS.error.uploadFailed)
    } finally {
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function insert() {
    const url = src.trim()
    if (!url) return
    if (onApply) {
      onApply({ src: url, alt, caption, align, width })
    } else {
      editor
        .chain()
        .focus()
        .insertImageFigure({ src: url, alt, caption, align, width })
        .run()
    }
    onDone()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={progress !== null}
            onClick={() => fileRef.current?.click()}
          >
            <ArrowUpTrayIcon className="size-4" />
            {TIPTAP_NS.figure.upload}
          </Button>
          <span className="text-muted-foreground text-xs">
            {TIPTAP_NS.figure.orUrl}
          </span>
          <Input
            dir="ltr"
            className="h-8 min-w-0 flex-1 font-mono text-xs"
            placeholder={TIPTAP_NS.figure.urlPlaceholder}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          />
        </div>
        {progress !== null ? <UploadProgressLine value={progress} /> : null}
        {src.trim() ? (
          <div className="bg-muted/30 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="mx-auto max-h-48 object-contain"
            />
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{TIPTAP_NS.figure.alt}</Label>
            <Input
              className="h-8"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{TIPTAP_NS.figure.caption}</Label>
            <Input
              className="h-8"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{TIPTAP_NS.figure.align}</Label>
            <select
              className={cn(selectClass, "h-8 w-full max-w-none")}
              value={align}
              onChange={(e) => setAlign(e.target.value as FigureAlign)}
            >
              {FIGURE_ALIGNS.map((a) => (
                <option key={a} value={a}>
                  {TIPTAP_NS.figure.alignLabel[a]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{TIPTAP_NS.figure.width}</Label>
            <select
              className={cn(selectClass, "h-8 w-full max-w-none")}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) as FigureWidth)}
            >
              {FIGURE_WIDTHS.map((w) => (
                <option key={w} value={w}>
                  {w}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>
          {TIPTAP_NS.figure.cancel}
        </Button>
        <Button type="button" disabled={!src.trim()} onClick={insert}>
          <PhotoIcon className="size-4" />
          {onApply ? TIPTAP_NS.figure.apply : TIPTAP_NS.figure.insert}
        </Button>
      </DialogFooter>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Audio dialog — upload / direct URL / embed (SoundCloud, Spotify, …)  */
/* ------------------------------------------------------------------ */

type AudioSourceMode = "upload" | "url" | "embed"

export function AudioInsertDialog({
  editor,
  entity,
  open,
  onOpenChange,
}: {
  editor: Editor
  entity?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{TIPTAP_NS.audio.dialogTitle}</DialogTitle>
        </DialogHeader>
        {open ? (
          <AudioInsertBody
            editor={editor}
            entity={entity}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AudioInsertBody({
  editor,
  entity,
  onDone,
}: {
  editor: Editor
  entity?: string
  onDone: () => void
}) {
  const A = TIPTAP_NS.audio
  const [mode, setMode] = useState<AudioSourceMode>("upload")
  const [url, setUrl] = useState("")
  const [embed, setEmbed] = useState("")
  const [title, setTitle] = useState("")
  const [progress, setProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setProgress(0)
    try {
      const result = await uploadMedia(file, entity ?? "audio", setProgress)
      setUrl(result.fileUrl)
      setMode("url")
    } catch (err) {
      toastApiError(err, TIPTAP_NS.error.uploadFailed)
    } finally {
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function insert() {
    const titleAttr = title.trim() || null
    if (mode === "embed") {
      const raw = embed.trim()
      if (!raw) return
      // Accept pasted <iframe> code, provider page links (SoundCloud,
      // Spotify, …) and ready-made player URLs alike.
      const src = extractIframeSrc(raw)
      const normalized = toAudioEmbedUrl(src) ?? src
      editor
        .chain()
        .focus()
        .insertContent({
          type: "audio",
          attrs: { src: normalized, title: titleAttr, embed: true },
        })
        .run()
    } else {
      const src = extractIframeSrc(url.trim())
      if (!src) return
      editor
        .chain()
        .focus()
        .insertContent({
          type: "audio",
          attrs: { src, title: titleAttr },
        })
        .run()
    }
    onDone()
  }

  const canInsert =
    progress === null &&
    (mode === "embed" ? !!embed.trim() : !!url.trim())

  const MODES: { key: AudioSourceMode; label: string }[] = [
    { key: "upload", label: A.tabUpload },
    { key: "url", label: A.tabUrl },
    { key: "embed", label: A.tabEmbed },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="bg-muted/40 inline-flex rounded-md p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "rounded px-3 py-1 text-xs transition-colors",
                mode === m.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={progress !== null}
              onClick={() => fileRef.current?.click()}
            >
              <ArrowUpTrayIcon className="size-4" />
              {A.upload}
            </Button>
            {progress !== null ? <UploadProgressLine value={progress} /> : null}
          </div>
        ) : mode === "url" ? (
          <div className="space-y-1.5">
            <Label className="text-xs">{A.urlLabel}</Label>
            <Input
              dir="ltr"
              className="h-8 font-mono text-xs"
              placeholder="https://…/track.mp3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-muted-foreground text-[11px]">
              {A.urlHint}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs">{A.embedLabel}</Label>
            <Input
              dir="ltr"
              className="h-8 font-mono text-xs"
              placeholder={A.embedPlaceholder}
              value={embed}
              onChange={(e) => setEmbed(e.target.value)}
            />
            <p className="text-muted-foreground text-[11px]">{A.embedHint}</p>
          </div>
        )}

        {mode !== "embed" && url.trim() ? (
          <audio controls src={url.trim()} className="w-full" />
        ) : null}
        {mode === "embed" && embed.trim() ? (
          <div className="bg-muted/30 overflow-hidden rounded-md border">
            <iframe
              src={extractIframeSrc(embed)}
              title="audio embed preview"
              className="h-[120px] w-full"
              allow="autoplay; clipboard-write; encrypted-media"
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <Label className="text-xs">{A.titleLabel}</Label>
          <Input
            className="h-8"
            placeholder={A.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>
          {TIPTAP_NS.figure.cancel}
        </Button>
        <Button type="button" disabled={!canInsert} onClick={insert}>
          <MusicalNoteIcon className="size-4" />
          {TIPTAP_NS.figure.insert}
        </Button>
      </DialogFooter>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Table menu                                                          */
/* ------------------------------------------------------------------ */

/** Word's Insert ▸ Table grid — hover to pick the size, click to insert,
 * with numeric fields for sizes past the grid (like Word's dialog). */
const PICKER_COLS = 10
const PICKER_ROWS = 8

function TableSizePicker({
  onPick,
}: {
  onPick: (rows: number, cols: number) => void
}) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const T = TIPTAP_NS.table
  const selR = hover?.r ?? -1
  const selC = hover?.c ?? -1

  return (
    <div className="px-1 py-1">
      <div
        className="grid w-fit gap-0.5"
        style={{ gridTemplateColumns: `repeat(${PICKER_COLS}, 1rem)` }}
        onMouseLeave={() => setHover(null)}
        role="grid"
        aria-label={T.insert}
      >
        {Array.from({ length: PICKER_ROWS }, (_, r) =>
          Array.from({ length: PICKER_COLS }, (_, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              role="gridcell"
              aria-label={`${c + 1} × ${r + 1}`}
              className={cn(
                "size-4 rounded-[2px] border transition-colors",
                r <= selR && c <= selC
                  ? "border-primary bg-primary/60"
                  : "border-border bg-background hover:border-primary/60",
              )}
              onMouseEnter={() => setHover({ r, c })}
              onFocus={() => setHover({ r, c })}
              onClick={() => onPick(r + 1, c + 1)}
            />
          )),
        )}
      </div>
      <p className="text-muted-foreground mt-1 text-center text-xs tabular-nums">
        {hover ? `${selC + 1} × ${selR + 1}` : `${cols} × ${rows}`}
      </p>
      {/* Exact numbers — Word's "Insert Table" dialog equivalent. The button
          gets its own full-width row: squeezed onto the labels row it clipped
          past the popup's overflow-x-hidden edge. */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
        <label className="text-muted-foreground flex items-center gap-1">
          {T.cols}
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) =>
              setCols(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
            }
            className="border-input bg-background h-7 w-12 rounded border px-1 text-center text-xs"
          />
        </label>
        <label className="text-muted-foreground flex items-center gap-1">
          {T.rows}
          <input
            type="number"
            min={1}
            max={100}
            value={rows}
            onChange={(e) =>
              setRows(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
            }
            className="border-input bg-background h-7 w-12 rounded border px-1 text-center text-xs"
          />
        </label>
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-1.5 h-7 w-full text-xs"
        onClick={() => onPick(rows, cols)}
      >
        {T.insert}
      </Button>
    </div>
  )
}

export function TableMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const inTable = editor.isActive("table")
  const tableStyle =
    (editor.getAttributes("table").tableStyle as TableStyle | undefined) ??
    "grid"
  const T = TIPTAP_NS.table
  const run = (fn: (chain: ReturnType<Editor["chain"]>) => unknown) => () =>
    fn(editor.chain().focus())
  const insert = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertCaptionedTable({ rows, cols, withHeaderRow: true })
      .run()
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <ToolbarTrigger label={TIPTAP_NS.toolbar.tableMenu} pressed={inTable}>
        <TableCellsIcon className="size-4" />
      </ToolbarTrigger>
      <DropdownMenuContent
        dir="rtl"
        align="start"
        className="w-60 max-w-60 min-w-60 overflow-x-hidden"
      >
        <TableSizePicker onPick={insert} />
        {inTable ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={run((c) => c.addRowBefore().run())}>
              {T.addRowBefore}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.addRowAfter().run())}>
              {T.addRowAfter}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.deleteRow().run())}>
              {T.deleteRow}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={run((c) => c.addColumnBefore().run())}>
              {T.addColBefore}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.addColumnAfter().run())}>
              {T.addColAfter}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.deleteColumn().run())}>
              {T.deleteCol}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editor.can().mergeCells()}
              onClick={run((c) => c.mergeCells().run())}
            >
              {T.mergeCells}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.can().splitCell()}
              onClick={run((c) => c.splitCell().run())}
            >
              {T.splitCell}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.toggleHeaderRow().run())}>
              {T.toggleHeaderRow}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={run((c) => c.toggleHeaderColumn().run())}>
              {T.toggleHeaderCol}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                {T.style}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={tableStyle}
                onValueChange={(v) =>
                  editor.chain().focus().setTableStyle(v as TableStyle).run()
                }
              >
                {TABLE_STYLES.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>
                    {T.styleLabel[s]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={run((c) => c.deleteTable().run())}
            >
              {T.delete}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------ */
/* Columns menu                                                        */
/* ------------------------------------------------------------------ */

export function ColumnsMenu({ editor }: { editor: Editor }) {
  const inColumns = editor.isActive("columns")
  return (
    <DropdownMenu>
      <ToolbarTrigger label={TIPTAP_NS.toolbar.columns} pressed={inColumns}>
        <ViewColumnsIcon className="size-4" />
      </ToolbarTrigger>
      <DropdownMenuContent dir="rtl" align="start" className="min-w-44">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().insertColumns(2).run()}
        >
          {TIPTAP_NS.toolbar.columns2}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().insertColumns(3).run()}
        >
          {TIPTAP_NS.toolbar.columns3}
        </DropdownMenuItem>
        {inColumns ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => editor.chain().focus().unsetColumns().run()}
            >
              {TIPTAP_NS.toolbar.columnsRemove}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
