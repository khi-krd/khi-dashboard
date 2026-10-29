"use client"

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { COMPRESS_NS } from "@/components/shared/compress-strings"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Spinner } from "@/components/ui/spinner"
import { formatBytes } from "@/hooks/use-file-upload"
import { formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type {
  CompressionBatchStats,
  StagedImageItem,
} from "@/hooks/use-image-compression"

const NS = COMPRESS_NS.card

function fileFormat(file: File): string {
  const ext = file.name.split(".").pop()
  if (ext && ext !== file.name && ext.length <= 5) return ext.toUpperCase()
  const sub = file.type?.split("/")[1]
  return sub ? sub.toUpperCase().replace("SVG+XML", "SVG") : "—"
}

function dims(item: { width: number | null; height: number | null }): string {
  return item.width && item.height
    ? `${formatEnDigits(item.width)}×${formatEnDigits(item.height)}`
    : ""
}

function Thumb({
  url,
  passthrough,
  className,
}: {
  url: string | null
  passthrough?: boolean
  className?: string
}) {
  const isImage = url != null && !passthrough
  return (
    <span
      className={cn(
        "bg-muted/50 border-border/60 relative block shrink-0 overflow-hidden rounded-md border",
        className,
      )}
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-muted-foreground flex size-full items-center justify-center">
          <PhotoIcon className="size-5 opacity-50" />
        </span>
      )}
    </span>
  )
}

function MetaLine({ item }: { item: StagedImageItem }) {
  return (
    <span className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-[11px]">
      <span>{fileFormat(item.file)}</span>
      {dims(item) ? (
        <>
          <span aria-hidden>·</span>
          <span dir="ltr">{dims(item)}</span>
        </>
      ) : null}
      <span aria-hidden>·</span>
      <span dir="ltr">{formatBytes(item.file.size)}</span>
    </span>
  )
}

/** A single staged file — original facts vs the processed output, computed
 * from real bytes only. Upload state overlays the same card. */
export function CompressionCompareCard({
  item,
  onRemove,
  onRetry,
}: {
  item: StagedImageItem
  onRemove?: () => void
  onRetry?: () => void
}) {
  const { status, result } = item
  const saved =
    result && result.reduced ? result.originalSize - result.outputSize : 0
  const savedPct =
    result && result.reduced && result.originalSize > 0
      ? Math.round((saved / result.originalSize) * 100)
      : 0
  const outIsImage = item.outputUrl != null
  const uploading = item.uploadStatus === "uploading"

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/10 relative rounded-lg border p-2.5",
        item.uploadStatus === "error" && "border-destructive/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Thumb
          url={item.previewUrl}
          passthrough={item.passthrough}
          className="size-12"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-xs font-medium" title={item.name}>
              {item.name}
            </p>
            {onRemove ? (
              <button
                type="button"
                aria-label={NS.remove}
                disabled={uploading}
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive -mt-0.5 shrink-0 rounded p-0.5 transition-colors disabled:opacity-40"
              >
                <XMarkIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
          <MetaLine item={item} />

          {status === "idle" ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Spinner className="size-3" />
              {NS.queued}
            </p>
          ) : null}

          {status === "compressing" ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-[11px]">
                {NS.compressing}
              </p>
              <UploadProgressLine
                value={item.compressProgress}
                compact
                className="max-w-[220px]"
              />
            </div>
          ) : null}

          {status === "done" && result ? (
            <div className="flex items-center gap-2">
              <ArrowLeftIcon className="text-muted-foreground size-3.5 shrink-0" />
              <Thumb
                url={item.outputUrl ?? item.previewUrl}
                passthrough={!outIsImage}
                className="size-9"
              />
              <span className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-[11px]">
                <span>{fileFormat(result.file)}</span>
                <span aria-hidden>·</span>
                <span dir="ltr" className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatBytes(result.outputSize)}
                </span>
                <span aria-hidden>·</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  −{formatEnDigits(savedPct)}% · {NS.saved}{" "}
                  <span dir="ltr">{formatBytes(saved)}</span>
                </span>
              </span>
            </div>
          ) : null}

          {status === "unchanged" ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
                {COMPRESS_NS.toggle.originalBadge}
              </span>
              {item.passthrough ? NS.passthrough : NS.unchanged}
            </p>
          ) : null}

          {status === "error" ? (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              {NS.error}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  <ArrowPathIcon className="size-3" />
                  {NS.retry}
                </button>
              ) : null}
            </p>
          ) : null}

          {item.uploadStatus === "uploading" ? (
            <UploadProgressLine
              value={item.uploadProgress}
              compact
              className="max-w-[240px]"
            />
          ) : null}
          {item.uploadStatus === "done" ? (
            <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="size-3.5" />
              {NS.uploaded}
            </p>
          ) : null}
          {item.uploadStatus === "error" ? (
            <p className="text-destructive flex items-center gap-1.5 text-[11px]">
              {NS.uploadFailed}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  <ArrowPathIcon className="size-3" />
                  {NS.retry}
                </button>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Aggregate strip — totals computed from bytes (Σorig−Σout)/Σorig, plus
 * compressed / unchanged / failed counts. Failed files are excluded from
 * the byte totals. */
export function CompressionBatchStrip({
  stats,
  className,
}: {
  stats: CompressionBatchStats
  className?: string
}) {
  if (stats.total === 0) return null
  return (
    <div
      className={cn(
        "border-border/70 bg-muted/30 text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-[11px]",
        className,
      )}
    >
      <span>
        {COMPRESS_NS.batch.total}:{" "}
        <span dir="ltr" className="font-medium text-foreground">
          {formatBytes(stats.originalBytes)}
        </span>
        {stats.outputBytes !== stats.originalBytes ? (
          <>
            {" ← "}
            <span dir="ltr" className="font-medium text-foreground">
              {formatBytes(stats.outputBytes)}
            </span>
          </>
        ) : null}
      </span>
      {stats.savedBytes > 0 ? (
        <span className="text-emerald-600 dark:text-emerald-400">
          {COMPRESS_NS.batch.saved}:{" "}
          <span dir="ltr">
            {formatBytes(stats.savedBytes)} (−{formatEnDigits(stats.savedPct)}%)
          </span>
        </span>
      ) : null}
      <span className="ms-auto flex items-center gap-x-3">
        {stats.compressed > 0 ? (
          <span>
            {formatEnDigits(stats.compressed)} {COMPRESS_NS.batch.compressed}
          </span>
        ) : null}
        {stats.unchanged > 0 ? (
          <span>
            {formatEnDigits(stats.unchanged)} {COMPRESS_NS.batch.unchanged}
          </span>
        ) : null}
        {stats.pending > 0 ? (
          <span>
            {formatEnDigits(stats.pending)} {COMPRESS_NS.batch.pending}
          </span>
        ) : null}
        {stats.failed > 0 ? (
          <span className="text-amber-700 dark:text-amber-400">
            {formatEnDigits(stats.failed)} {COMPRESS_NS.batch.failed}
          </span>
        ) : null}
      </span>
    </div>
  )
}
