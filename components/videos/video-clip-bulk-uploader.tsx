"use client"

import {
  CloudArrowUpIcon,
  FilmIcon,
} from "@heroicons/react/24/outline"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"

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
const MAX_CLIP_FILES = 50

type Clip = VideoFormValues["videoClipItems"][number]

function clipHasStagedFile(clip: Clip, file: File): boolean {
  return (
    clip.stagedVideoFile?.name === file.name &&
    clip.stagedVideoFile?.size === file.size
  )
}

export function VideoClipBulkUploader({
  clipCount,
  onClipsAdded,
}: {
  clipCount: number
  onClipsAdded?: (count: number) => void
}) {
  const { watch, setValue } = useFormContext<VideoFormValues>()
  const [processingCount, setProcessingCount] = useState(0)
  const [pendingNames, setPendingNames] = useState<string[]>([])

  const remainingSlots = Math.max(0, MAX_CLIP_FILES - clipCount)

  const addFilesAsClips = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || remainingSlots <= 0) return

      const contentLanguages = watch("contentLanguages")
      const existing = watch("videoClipItems")
      const toProcess = files
        .filter(
          (file) => !existing.some((clip) => clipHasStagedFile(clip, file)),
        )
        .slice(0, remainingSlots)

      if (toProcess.length === 0) return

      setProcessingCount(toProcess.length)
      setPendingNames(toProcess.map((f) => f.name))

      const newClips: Clip[] = []
      for (const file of toProcess) {
        const meta = await applyVideoFileMeta(file)
        const title = titleFromVideoFileName(file.name)
        newClips.push({
          url: "",
          externalUrl: "",
          embedUrl: "",
          clipNumber: existing.length + newClips.length + 1,
          durationSeconds: meta.durationSeconds,
          resolution: meta.resolution,
          fileFormat: meta.fileFormat,
          fileSizeMb: meta.fileSizeMb,
          titleCkb: contentLanguages.includes("CKB") ? title : "",
          titleKmr: contentLanguages.includes("KMR") ? title : "",
          descriptionCkb: "",
          descriptionKmr: "",
          stagedVideoFile: file,
        })
      }

      const merged = [...existing, ...newClips].map((clip, index) => ({
        ...clip,
        clipNumber: index + 1,
      }))

      setValue("videoClipItems", merged, { shouldDirty: true })
      onClipsAdded?.(newClips.length)
      setProcessingCount(0)
      setPendingNames([])
    },
    [onClipsAdded, remainingSlots, setValue, watch],
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
      void addFilesAsClips(files)
      queueMicrotask(() => clearFiles())
    },
  })

  const isProcessing = processingCount > 0
  const disabled = remainingSlots <= 0 || isProcessing

  return (
    <div className="space-y-3">
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
        <input
          {...getInputProps({ disabled })}
          className="sr-only"
        />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <Spinner className="size-8" />
            <p className="text-muted-foreground text-sm">
              {NS.clip.bulk_processing(formatEnDigits(processingCount))}
            </p>
            {pendingNames.length > 0 ? (
              <ul className="text-muted-foreground max-w-md space-y-1 text-xs">
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
            <CloudArrowUpIcon className="size-10 opacity-50" />
            <span className="font-medium">{NS.clip.bulk_drop}</span>
            <span className="text-xs">{NS.clip.bulk_helper}</span>
            <span className="text-xs opacity-80">
              {NS.source.file_helper} · {formatBytes(MAX_VIDEO_FILE_BYTES)}
              {remainingSlots < MAX_CLIP_FILES
                ? ` · ${formatEnDigits(remainingSlots)} ماوە`
                : null}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{NS.clip.bulk_or_manual}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={openFileDialog}
        >
          <FilmIcon className="size-4" />
          {NS.clip.bulk_browse}
        </Button>
      </div>

      {remainingSlots <= 0 ? (
        <p className="text-destructive text-xs">
          {NS.clip.bulk_max(formatEnDigits(MAX_CLIP_FILES))}
        </p>
      ) : null}

      {uploadErrors.map((err) => (
        <p key={err} className="text-destructive text-xs">
          {err}
        </p>
      ))}
    </div>
  )
}
