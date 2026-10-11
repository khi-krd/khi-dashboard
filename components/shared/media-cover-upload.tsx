"use client"

import {
  ArrowUpTrayIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFileUpload } from "@/hooks/use-file-upload"
import { mediaTypeFromFile } from "@/lib/tiptap-media"
import { VideoUrlPreview } from "@/components/shared/video-url-preview"
import { uploadMedia } from "@/services/mediaService"
import { cn } from "@/lib/utils"

const DEFAULT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif"
const DEFAULT_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/*"
const DEFAULT_AUDIO_ACCEPT = "audio/mpeg,audio/wav,audio/ogg,audio/*"
const DEFAULT_IMAGE_MAX = 20 * 1024 * 1024
const DEFAULT_VIDEO_MAX = 500 * 1024 * 1024
const DEFAULT_AUDIO_MAX = 200 * 1024 * 1024

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
}) {
  const resolvedAccept = accept ?? VARIANT_ACCEPT[variant]
  const resolvedMaxSize = maxSize ?? VARIANT_MAX[variant]
  const texts = VARIANT_TEXTS[variant]
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const preview = previewUrl?.trim() || null

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
      void uploadFile(entry.file)
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  async function uploadFile(file: File) {
    clearErrors()
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadMedia(file, mediaTypeFromFile(file), setProgress)
      onUrlChange(result.fileUrl)
    } catch {
      toast.error(TIPTAP_NS.error.uploadFailed)
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }

  function handleRemove() {
    clearFiles()
    clearErrors()
    onUrlChange("")
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
        <input {...getInputProps()} className="sr-only" />
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
