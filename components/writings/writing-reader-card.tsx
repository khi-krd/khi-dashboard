"use client"

import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"

import { WritingFormatPill } from "@/components/writings/writing-format-pill"
import { NS } from "@/components/writings/writings-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatEnDigits } from "@/lib/intl-ckb"
import { humanReadableSize, urlBasename } from "@/lib/writing-format"
import { cn } from "@/lib/utils"
import type { BookFileFormat, Language, WritingContentDto } from "@/types/writings"

export function WritingReaderCard({
  lang,
  content,
}: {
  lang: Language
  content: WritingContentDto | null | undefined
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const langLabel = lang === "CKB" ? NS.lang.ckb : NS.lang.kmr
  const fileUrl = content?.fileUrl?.trim() ?? ""
  const format = (content?.fileFormat ?? "OTHER") as BookFileFormat
  const canPreview = format === "PDF" && !!fileUrl

  if (!fileUrl) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed p-4 text-sm italic">
        {langLabel} — فایل بەردەست نییە
      </div>
    )
  }

  const name = urlBasename(fileUrl)

  return (
    <>
      <div className="border-border flex flex-wrap items-center gap-3 rounded-lg border p-4">
        <div
          className={cn(
            "bg-muted flex size-14 shrink-0 items-center justify-center rounded-lg",
            canPreview && "ring-primary/30 ring-2",
          )}
        >
          <DocumentTextIcon className="text-muted-foreground size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{langLabel}</p>
          <p className="truncate font-medium">{name || NS.field.book_file_label}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <WritingFormatPill format={format} />
            {content?.pageCount != null && content.pageCount > 0 ? (
              <span className="text-muted-foreground text-xs">
                {formatEnDigits(content.pageCount)} {NS.pages.suffix}
              </span>
            ) : null}
            {content?.fileSizeBytes ? (
              <span className="text-muted-foreground font-mono text-[10px]">
                {humanReadableSize(content.fileSizeBytes)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {canPreview ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <EyeIcon className="size-4" />
              {NS.action.preview}
            </Button>
          ) : null}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1")}
          >
            <ArrowDownTrayIcon className="size-4" />
            {NS.action.download}
          </a>
        </div>
      </div>

      {previewOpen && canPreview ? (
        <div className="bg-background/95 fixed inset-0 z-[100] flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-medium">
              {NS.action.preview} — {langLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setPreviewOpen(false)}
            >
              <XMarkIcon className="size-5" />
            </Button>
          </div>
          <iframe
            src={fileUrl}
            title={name}
            className="flex-1 border-0"
          />
        </div>
      ) : null}
    </>
  )
}
