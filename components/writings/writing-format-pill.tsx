"use client"

import { DocumentIcon } from "@heroicons/react/24/outline"

import { cn } from "@/lib/utils"
import type { BookFileFormat } from "@/types/writings"

const FORMAT_CLASSES: Record<BookFileFormat, string> = {
  PDF: "text-red-600 dark:text-red-400 bg-red-500/5",
  DOCX: "text-blue-600 dark:text-blue-400 bg-blue-500/5",
  EPUB: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
  TXT: "text-muted-foreground bg-muted",
  OTHER: "text-muted-foreground bg-muted",
}

export function WritingFormatPill({
  format,
  className,
}: {
  format: BookFileFormat | string | null | undefined
  className?: string
}) {
  const f = (format?.toUpperCase() ?? "OTHER") as BookFileFormat
  const valid = f in FORMAT_CLASSES ? f : "OTHER"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase",
        FORMAT_CLASSES[valid],
        className,
      )}
    >
      {valid === "OTHER" ? (
        <DocumentIcon className="size-3" aria-hidden />
      ) : null}
      {valid}
    </span>
  )
}
