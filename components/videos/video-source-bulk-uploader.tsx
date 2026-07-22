"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CloudUploadIcon,
  FilmIcon,
} from "@hugeicons/core-free-icons"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import {
  applyVideoFileMeta,
  titleFromVideoFileName,
} from "@/lib/video-file-utils"
import { formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

const MAX_VIDEO_FILE_BYTES = 500 * 1024 * 1024
const MAX_SOURCE_FILES = 20

type Source = VideoFormValues["videoSources"][number]

function sourceHasStagedFile(source: Source, file: File): boolean {
  return (
    source.stagedVideoFile?.name === file.name &&
    source.stagedVideoFile?.size === file.size
  )
}

export function VideoSourceBulkUploader({
  sourceCount,
  onSourcesAdded,
}: {
  sourceCount: number
  onSourcesAdded?: (count: number) => void
}) {
  const { watch, setValue } = useFormContext<VideoFormValues>()
  const [processingCount, setProcessingCount] = useState(0)
  const [pendingNames, setPendingNames] = useState<string[]>([])

  const remainingSlots = Math.max(0, MAX_SOURCE_FILES - sourceCount)

  const addFilesAsSources = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || remainingSlots <= 0) return

      const existing = watch("videoSources")
      const toProcess = files
        .filter(
          (file) => !existing.some((source) => sourceHasStagedFile(source, file)),
        )
        .slice(0, remainingSlots)

      if (toProcess.length === 0) return

      setProcessingCount(toProcess.length)
      setPendingNames(toProcess.map((f) => f.name))

      const hadSources = existing.some(
        (s) =>
          s.url?.trim() ||
          s.externalUrl?.trim() ||
          s.embedUrl?.trim() ||
          s.stagedVideoFile,
      )

      const newSources: Source[] = []
      for (const file of toProcess) {
        const meta = await applyVideoFileMeta(file)
        const label = titleFromVideoFileName(file.name)
        const isFirst = !hadSources && newSources.length === 0
        newSources.push({
          url: "",
          externalUrl: "",
          embedUrl: "",
          main: isFirst,
          label,
          durationSeconds: meta.durationSeconds,
          resolution: meta.resolution,
          fileFormat: meta.fileFormat,
          fileSizeMb: meta.fileSizeMb,
          stagedVideoFile: file,
        })
      }

      const merged = [...existing, ...newSources]
      if (!merged.some((s) => s.main) && merged.length > 0) {
        merged[0] = { ...merged[0], main: true }
      }

      setValue("videoSources", merged, { shouldDirty: true })
      setValue("sourcesTouched", true, { shouldDirty: true })
      onSourcesAdded?.(newSources.length)
      setProcessingCount(0)
      setPendingNames([])
    },
    [onSourcesAdded, remainingSlots, setValue, watch],
  )

  const [
    { isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      clearFiles,
    },
  ] = useFileUpload({
    maxFiles: remainingSlots,
    maxSize: MAX_VIDEO_FILE_BYTES,
    accept: "video/*",
    multiple: true,
    onFilesAdded: (added) => {
      const files = added
        .map((entry) => entry.file)
        .filter((file): file is File => file instanceof File)
      void addFilesAsSources(files)
      queueMicrotask(() => clearFiles())
    },
  })

  const isProcessing = processingCount > 0
  const disabled = remainingSlots <= 0 || isProcessing

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed transition-colors",
          disabled && "pointer-events-none opacity-60",
          isDragging && !disabled && "border-primary bg-primary/5",
          !isDragging && !disabled && "border-border hover:border-primary/40",
        )}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input {...getInputProps({ disabled })} className="sr-only" />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <Spinner className="size-8" />
            <p className="text-muted-foreground text-sm">
              {NS.source.bulk_processing(formatEnDigits(processingCount))}
            </p>
            {pendingNames.length > 0 ? (
              <ul className="text-muted-foreground max-w-md text-xs">
                {pendingNames.slice(0, 5).map((name) => (
                  <li key={name} className="truncate">
                    {name}
                  </li>
                ))}
                {pendingNames.length > 5 ? (
                  <li>+{formatEnDigits(pendingNames.length - 5)} …</li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={openFileDialog}
            className="text-muted-foreground flex w-full flex-col items-center gap-2 p-6 text-sm"
          >
            <HugeiconsIcon
              icon={CloudUploadIcon}
              strokeWidth={2}
              className="size-10 opacity-50"
            />
            <span className="font-medium">{NS.source.bulk_drop}</span>
            <span className="text-xs">{NS.source.bulk_helper}</span>
            <span className="text-xs opacity-80">
              {NS.source.file_helper} · {formatBytes(MAX_VIDEO_FILE_BYTES)}
              {remainingSlots < MAX_SOURCE_FILES
                ? ` · ${formatEnDigits(remainingSlots)} ماوە`
                : null}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{NS.source.bulk_or_manual}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={openFileDialog}
        >
          <HugeiconsIcon icon={FilmIcon} strokeWidth={2} data-icon="inline-start" />
          {NS.source.bulk_browse}
        </Button>
      </div>

      {remainingSlots <= 0 ? (
        <p className="text-destructive text-xs">
          {NS.source.bulk_max(formatEnDigits(MAX_SOURCE_FILES))}
        </p>
      ) : null}

      {uploadErrors.length > 0 ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>هەڵەی بارکردن</AlertTitle>
          <AlertDescription>
            {uploadErrors.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
