"use client"

import {
  ArrowUpTrayIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import { CompressionCompareCard } from "@/components/shared/compression-compare"
import { CompressionToggle } from "@/components/shared/compression-toggle"
import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MAX_UPLOAD_BYTES, useFileUpload } from "@/hooks/use-file-upload"
import {
  isUploadable,
  stagedUploadFile,
  useImageCompression,
} from "@/hooks/use-image-compression"
import {
  compressionSettingsToOptions,
  DEFAULT_COMPRESSION_SETTINGS,
  type CompressionSettings,
} from "@/lib/image-compression"
import { mediaTypeFromFile } from "@/lib/tiptap-media"
import { VideoUrlPreview } from "@/components/shared/video-url-preview"
import { uploadMedia } from "@/services/mediaService"
import { cn } from "@/lib/utils"
import { toastApiError } from "@/lib/toast"

const DEFAULT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif"
const DEFAULT_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/*"
const DEFAULT_AUDIO_ACCEPT = "audio/mpeg,audio/wav,audio/ogg,audio/*"
const DEFAULT_IMAGE_MAX = MAX_UPLOAD_BYTES
const DEFAULT_VIDEO_MAX = MAX_UPLOAD_BYTES
const DEFAULT_AUDIO_MAX = MAX_UPLOAD_BYTES

type MediaVariant = "image" | "video" | "audio"

const VARIANT_ACCEPT: Record<MediaVariant, string> = {
  image: DEFAULT_IMAGE_ACCEPT,
  video: DEFAULT_VIDEO_ACCEPT,
  audio: DEFAULT_AUDIO_ACCEPT,
}
const VARIANT_MAX: Record<MediaVariant, number> = {
  image: DEFAULT_IMAGE_MAX,
  video: DEFAULT_VIDEO_MAX,
  audio: DEFAULT_AUDIO_MAX,
}
const VARIANT_TEXTS: Record<
  MediaVariant,
  { dropHint: string; upload: string; urlLabel: string }
> = {
  image: {
    dropHint: TIPTAP_NS.cover.dropHint,
    upload: TIPTAP_NS.cover.upload,
    urlLabel: TIPTAP_NS.cover.urlLabel,
  },
  video: {
    dropHint: TIPTAP_NS.video.dropHint,
    upload: TIPTAP_NS.video.upload,
    urlLabel: TIPTAP_NS.video.urlLabel,
  },
  audio: {
    dropHint: TIPTAP_NS.audio.dropHint,
    upload: TIPTAP_NS.audio.upload,
    urlLabel: TIPTAP_NS.audio.urlLabel,
  },
}

export function MediaCoverUpload({
  label,
  previewUrl,
  urlValue,
  onUrlChange,
  urlError,
  accept,
  maxSize,
  aspectClass = "aspect-[21/9]",
  helperText,
  variant = "image",
  entity,
  compact = false,
  compressOptions,
}: {
  label?: string
  previewUrl: string | null
  urlValue: string
  onUrlChange: (url: string) => void
  urlError?: string
  accept?: string
  maxSize?: number
  aspectClass?: string
  helperText?: string
  variant?: MediaVariant
  /** Owning entity for the R2 folder layout ("news" → news/images/…). */
  entity?: string
  /** Small horizontal layout: thumb + controls side by side. */
  compact?: boolean
  /**
   * When truthy, enables the pre-upload image-compression UI: a
   * "باشکردنی وێنە پێش بارکردن" toggle + a before-upload compare card.
   * Pass an object to seed `DEFAULT_COMPRESSION_SETTINGS`. Only rendered
   * for `variant="image"` in the non-compact layout.
   */
  compressOptions?: boolean | Partial<CompressionSettings>
}) {
  const resolvedAccept = accept ?? VARIANT_ACCEPT[variant]
  const resolvedMaxSize = maxSize ?? VARIANT_MAX[variant]
  const texts = VARIANT_TEXTS[variant]
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const preview = previewUrl?.trim() || null

  const compressionEnabled =
    !!compressOptions && variant === "image" && !compact
  const [settings, setSettings] = useState<CompressionSettings>(() => ({
    ...DEFAULT_COMPRESSION_SETTINGS,
    ...(typeof compressOptions === "object" ? compressOptions : {}),
  }))
  const compression = useImageCompression(
    compressionSettingsToOptions(settings),
  )
  const staged = compression.items[0] ?? null
  const stagedBusy =
    staged != null &&
    (staged.status === "idle" || staged.status === "compressing")
  const busy = uploading || stagedBusy
  // Guards StrictMode double-effects and settings-change requeues: each
  // staged file uploads exactly once.
  const uploadStartedRef = useRef(new Set<string>())
  const uploadingIdRef = useRef<string | null>(null)

  // Declared before `useFileUpload` (which references it in onFilesAdded) so
  // no binding is accessed ahead of its declaration.
  async function uploadFile(file: File): Promise<boolean> {
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadMedia(
        file,
        entity ?? mediaTypeFromFile(file),
        (pct) => {
          setProgress(pct)
          const id = uploadingIdRef.current
          if (id) compression.updateItem(id, { uploadProgress: pct })
        },
      )
      onUrlChange(result.fileUrl)
      return true
    } catch (err) {
      toastApiError(err, TIPTAP_NS.error.uploadFailed)
      return false
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      clearFiles,
      clearErrors,
      removeFile,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: resolvedMaxSize,
    accept: resolvedAccept,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      clearErrors()
      if (compressionEnabled) {
        // Stage the pick — the card shows the before/after bytes, then the
        // effect below pushes the result through the same upload path.
        compression.clear()
        compression.addFiles([entry.file], settings.enabled)
      } else {
        void uploadFile(entry.file)
      }
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  // Once the staged file settles (compressed / unchanged / failed), send it:
  // the compressed File when it shrank, the original bytes otherwise.
  useEffect(() => {
    if (!compressionEnabled || !staged || !isUploadable(staged)) return
    if (uploadStartedRef.current.has(staged.id)) return
    uploadStartedRef.current.add(staged.id)
    uploadingIdRef.current = staged.id
    compression.updateItem(staged.id, {
      uploadStatus: "uploading",
      uploadProgress: 0,
    })
    void uploadFile(stagedUploadFile(staged)).then((ok) => {
      compression.updateItem(staged.id, {
        uploadStatus: ok ? "done" : "error",
        uploadProgress: null,
      })
      uploadingIdRef.current = null
    })
  })

  function handleRemove() {
    clearFiles()
    clearErrors()
    compression.clear()
    onUrlChange("")
  }

  if (compact) {
    return (
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative w-36 shrink-0 overflow-hidden rounded-lg border transition-colors",
            "aspect-video",
            isDragging
              ? "border-primary border-dashed bg-primary/5"
              : "border-border bg-muted/30",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input {...getInputProps()} className="sr-only" />
          {preview ? (
            variant === "video" ? (
              <VideoUrlPreview url={preview} />
            ) : variant === "audio" ? (
              <div className="text-muted-foreground flex size-full items-center justify-center p-2">
                <SpeakerWaveIcon className="size-8 opacity-40" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            )
          ) : (
            <button
              type="button"
              onClick={openFileDialog}
              aria-label={texts.upload}
              className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 p-2 text-[11px]"
            >
              {variant === "video" ? (
                <VideoCameraIcon className="size-6 opacity-40" />
              ) : variant === "audio" ? (
                <SpeakerWaveIcon className="size-6 opacity-40" />
              ) : (
                <PhotoIcon className="size-6 opacity-40" />
              )}
              <span className="line-clamp-1">{helperText ?? texts.upload}</span>
            </button>
          )}
          {uploading ? (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center p-2">
              <UploadProgressLine value={progress} className="w-full" />
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {label ? (
            <Label className="text-muted-foreground text-xs">{label}</Label>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Input
              dir="ltr"
              className="h-8 flex-1 font-mono text-xs"
              placeholder="https://…"
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={openFileDialog}
            >
              <ArrowUpTrayIcon className="size-4" />
              {texts.upload}
            </Button>
            {preview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                {TIPTAP_NS.cover.remove}
              </Button>
            ) : null}
          </div>
          {urlError ? <FieldError>{urlError}</FieldError> : null}
          {errors.length > 0 ? <FieldError>{errors[0]}</FieldError> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border transition-colors",
          aspectClass,
          isDragging
            ? "border-primary border-dashed bg-primary/5"
            : "border-border bg-muted/30",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps({ disabled: busy })} className="sr-only" />
        {preview ? (
          variant === "video" ? (
            <VideoUrlPreview url={preview} />
          ) : variant === "audio" ? (
            <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-3 p-4">
              <SpeakerWaveIcon className="size-10 opacity-40" />
              <audio src={preview} controls className="w-full" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          )
        ) : (
          <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
            {variant === "video" ? (
              <VideoCameraIcon className="size-10 opacity-40" />
            ) : variant === "audio" ? (
              <SpeakerWaveIcon className="size-10 opacity-40" />
            ) : (
              <PhotoIcon className="size-10 opacity-40" />
            )}
            <span>{helperText ?? texts.dropHint}</span>
          </div>
        )}
        {uploading ? (
          <div className="bg-background/70 absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-sm">
            <span>{TIPTAP_NS.cover.uploading}</span>
            <UploadProgressLine value={progress} className="max-w-[240px]" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={openFileDialog}
        >
          <ArrowUpTrayIcon className="size-4" />
          {texts.upload}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            {TIPTAP_NS.cover.remove}
          </Button>
        ) : null}
      </div>
      {compressionEnabled ? (
        <>
          <CompressionToggle
            value={settings}
            onChange={setSettings}
            disabled={uploading}
          />
          {staged ? (
            <CompressionCompareCard
              item={staged}
              onRemove={uploading ? undefined : () => compression.clear()}
              onRetry={
                staged.status === "error" && !uploading
                  ? () => compression.requeue(staged.id)
                  : staged.uploadStatus === "error" && !uploading
                    ? () => {
                        uploadStartedRef.current.delete(staged.id)
                        compression.updateItem(staged.id, {
                          uploadStatus: "idle",
                        })
                      }
                    : undefined
              }
            />
          ) : null}
        </>
      ) : null}
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">
          {texts.urlLabel}
        </Label>
        <Input
          dir="ltr"
          className="font-mono text-xs"
          placeholder="https://…"
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        {urlError ? <FieldError>{urlError}</FieldError> : null}
        {errors.length > 0 ? (
          <FieldError>{errors[0]}</FieldError>
        ) : null}
      </div>
    </div>
  )
}
