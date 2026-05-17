"use client"

import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

import { WritingFormatPill } from "@/components/writings/writing-format-pill"
import { NS } from "@/components/writings/writings-strings"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFileUpload } from "@/hooks/use-file-upload"
import {
  guessBookFormatFromFilename,
  humanReadableSize,
  urlBasename,
} from "@/lib/writing-format"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { BookFileFormat, Language } from "@/types/writings"

const BOOK_ACCEPT =
  ".pdf,.doc,.docx,.epub,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
const MAX_BYTES = 50 * 1024 * 1024

const FORMATS: BookFileFormat[] = ["PDF", "DOCX", "EPUB", "TXT", "OTHER"]

export type BookContentFields = {
  fileUrl?: string
  fileFormat?: BookFileFormat
  fileSizeBytes?: number
  pageCount?: number
}

export function WritingBookFileUploader({
  lang,
  inactive,
  stagedFile,
  content,
  existingFileUrl,
  onStagedFileChange,
  onContentChange,
}: {
  lang: Language
  inactive?: boolean
  stagedFile: File | null
  content: BookContentFields
  existingFileUrl?: string | null
  onStagedFileChange: (f: File | null) => void
  onContentChange: (patch: Partial<BookContentFields>) => void
}) {
  const [urlOpen, setUrlOpen] = useState(false)
  const langLabel = lang === "CKB" ? NS.lang.ckb : NS.lang.kmr

  const [
    { isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      removeFile,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_BYTES,
    accept: BOOK_ACCEPT,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      const format = guessBookFormatFromFilename(entry.file.name)
      onStagedFileChange(entry.file)
      onContentChange({
        fileUrl: "",
        fileFormat: format,
        fileSizeBytes: entry.file.size,
      })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const hasStaged = !!stagedFile
  const hasExisting = !!existingFileUrl?.trim() && !hasStaged
  const displayName =
    stagedFile?.name ??
    (content.fileUrl?.trim()
      ? urlBasename(content.fileUrl)
      : hasExisting
        ? urlBasename(existingFileUrl)
        : null)

  useEffect(() => {
    if (inactive) {
      onStagedFileChange(null)
    }
  }, [inactive, onStagedFileChange])

  if (inactive) {
    return (
      <p className="text-muted-foreground text-xs italic">
        {langLabel} — {NS.validation.languageRequired}
      </p>
    )
  }

  return (
    <div className="border-border space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">
          {NS.field.book_file_label} ({langLabel})
        </Label>
        {content.fileFormat ? (
          <WritingFormatPill format={content.fileFormat} />
        ) : null}
      </div>

      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors",
          isDragging && "border-primary bg-primary/5",
          (hasStaged || hasExisting || content.fileUrl?.trim()) &&
            "border-solid",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />
        {displayName ? (
          <div className="flex w-full flex-col items-center gap-2 py-2 text-center">
            <DocumentTextIcon className="text-primary size-10 opacity-70" />
            <p className="max-w-full truncate text-sm font-medium">{displayName}</p>
            {content.fileSizeBytes ? (
              <p className="text-muted-foreground text-xs">
                {humanReadableSize(content.fileSizeBytes)}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <button
                type="button"
                className="text-primary underline"
                onClick={openFileDialog}
              >
                {NS.action.change}
              </button>
              <button
                type="button"
                className="text-destructive underline"
                onClick={() => {
                  onStagedFileChange(null)
                  onContentChange({
                    fileUrl: "",
                    fileFormat: undefined,
                    fileSizeBytes: 0,
                  })
                }}
              >
                {NS.action.delete}
              </button>
              {(existingFileUrl?.trim() || content.fileUrl?.trim()) && !hasStaged ? (
                <a
                  href={content.fileUrl?.trim() || existingFileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  <ArrowDownTrayIcon className="size-3.5" />
                  {NS.action.download}
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFileDialog}
            className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-sm"
          >
            <CloudArrowUpIcon className="size-10 opacity-50" />
            {NS.field.book_file_drop}
          </button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{NS.field.book_file_helper}</p>
      {uploadErrors[0] ? (
        <FieldError>{uploadErrors[0]}</FieldError>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.format}</Label>
          <Select
            value={content.fileFormat ?? ""}
            onValueChange={(v) =>
              onContentChange({ fileFormat: v as BookFileFormat })
            }
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder={NS.field.format} />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.page_count}</Label>
          <Input
            type="number"
            min={1}
            className="h-9"
            placeholder={NS.field.page_count_placeholder}
            value={content.pageCount ?? ""}
            onChange={(e) => {
              const v = e.target.value
              onContentChange({
                pageCount: v === "" ? undefined : Number(v),
              })
            }}
          />
          <p className="text-muted-foreground text-[10px]">
            {NS.field.page_count_helper}
          </p>
        </div>
      </div>

      <Collapsible open={urlOpen} onOpenChange={setUrlOpen}>
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground text-xs underline">
          {NS.action.use_url_instead}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Input
            dir="ltr"
            value={content.fileUrl ?? ""}
            onChange={(e) => {
              onStagedFileChange(null)
              onContentChange({ fileUrl: e.target.value })
            }}
            placeholder="https://"
            disabled={hasStaged}
          />
        </CollapsibleContent>
      </Collapsible>

      {content.pageCount != null && content.pageCount > 0 ? (
        <p className="text-muted-foreground text-xs">
          {formatCkbDigits(content.pageCount)} {NS.pages.suffix}
        </p>
      ) : null}
    </div>
  )
}
