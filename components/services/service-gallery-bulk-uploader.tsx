"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CloudUploadIcon,
} from "@hugeicons/core-free-icons"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { formatBytes, MAX_UPLOAD_BYTES, useFileUpload } from "@/hooks/use-file-upload"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { captureVideoFrame } from "@/lib/video-thumbnail"
import {
  createEmptyGallerySlot,
  type ServiceFormValues,
} from "@/lib/validations/services"
import { uploadMedia } from "@/services/mediaService"

const MAX_FILE_BYTES = MAX_UPLOAD_BYTES
const MAX_GALLERY_FILES = 24
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i

function typeFromFile(file: File): "IMAGE" | "VIDEO" {
  if (file.type.startsWith("video/") || VIDEO_EXT.test(file.name)) {
    return "VIDEO"
  }
  return "IMAGE"
}

export function ServiceGalleryBulkUploader({
  slotCount,
  compact = false,
}: {
  slotCount: number
  compact?: boolean
}) {
  const { watch, setValue } = useFormContext<ServiceFormValues>()
  const [uploading, setUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  const remainingSlots = Math.max(0, MAX_GALLERY_FILES - slotCount)
  // In-flight picks consume gallery slots too, so a second batch can't
  // overflow the cap while the first is still uploading.
  const openSlots = Math.max(0, remainingSlots - uploadingCount)

  const stageFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0 || openSlots <= 0) return
      const batch = files.slice(0, openSlots)
      setUploading(true)
      setUploadingCount((n) => n + batch.length)
      void (async () => {
        try {
          const existing = watch("galleryMedia") ?? []
          const newSlots = []
          for (const file of batch) {
            try {
              const result = await uploadMedia(file, "services")
              const type = typeFromFile(file)
              // Video files get an auto poster: grab a frame from the LOCAL
              // file (blob URL — no CORS taint) and upload it alongside.
              let posterUrl = ""
              if (type === "VIDEO") {
                const frame = await captureVideoFrame({ kind: "file", file })
                if (frame) {
                  try {
                    posterUrl = (await uploadMedia(frame, "services")).fileUrl
                  } catch {
                    posterUrl = ""
                  }
                }
              }
              newSlots.push({
                ...createEmptyGallerySlot(),
                type,
                url: result.fileUrl,
                posterUrl,
              })
            } catch {
              // Failed sibling never reaches the gallery — the rest land.
            }
          }
          if (newSlots.length > 0) {
            setValue("galleryMedia", [...existing, ...newSlots], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        } finally {
          setUploadingCount((n) => Math.max(0, n - batch.length))
          setUploading(false)
        }
      })()
    },
    [openSlots, setValue, watch],
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
    maxFiles: openSlots,
    maxSize: MAX_FILE_BYTES,
    accept: "image/*,video/*",
    multiple: true,
    onFilesAdded: (added) => {
      const files = added
        .map((entry) => entry.file)
        .filter((file): file is File => file instanceof File)
      stageFiles(files)
      queueMicrotask(() => clearFiles())
    },
  })

  const disabled = openSlots <= 0 || uploading

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border border-dashed transition-colors",
          compact ? "min-h-[88px]" : "min-h-[120px]",
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
        <button
          type="button"
          disabled={disabled}
          onClick={openFileDialog}
          className={cn(
            "text-muted-foreground flex w-full items-center justify-center gap-3 p-4 text-sm",
            compact && "flex-col gap-1.5 sm:flex-row",
          )}
        >
          <HugeiconsIcon
            icon={CloudUploadIcon}
            strokeWidth={2}
            className={cn("opacity-50", compact ? "size-7" : "size-10")}
          />
          <span className="text-center">
            <span className="font-medium">{NS.gallery.bulkDrop}</span>
            {!compact ? (
              <>
                <br />
                <span className="text-xs">{NS.gallery.bulkHelper}</span>
              </>
            ) : (
              <span className="text-muted-foreground block text-xs">
                {NS.gallery.bulkHelper}
              </span>
            )}
          </span>
        </button>
      </div>

      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={openFileDialog}
          >
            {NS.action.upload_files}
          </Button>
          <span className="text-muted-foreground text-xs">
            {formatBytes(MAX_FILE_BYTES)}
          </span>
        </div>
      ) : null}

      {remainingSlots <= 0 ? (
        <p className="text-destructive text-xs">
          {NS.gallery.bulkMax(formatCkbDigits(MAX_GALLERY_FILES))}
        </p>
      ) : null}

      {uploadErrors.length > 0 ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>{NS.upload.failed}</AlertTitle>
          <AlertDescription>{uploadErrors[0]}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
