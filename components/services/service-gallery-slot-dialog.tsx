"use client"

import {
  ArrowUpTrayIcon,
  PhotoIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { NS } from "@/components/services/services-strings"
import { VideoUrlPreview } from "@/components/shared/video-url-preview"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  extractIframeSrc,
  isIframeMarkup,
} from "@/lib/embed-url"
import { captureVideoFrame } from "@/lib/video-thumbnail"
import { isDirectVideoFile } from "@/lib/video-embed"
import {
  extractVimeoId,
  vimeoPosterUrl,
  youtubeThumb,
} from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { ServiceGalleryMediaFormValues } from "@/lib/validations/services"
import { toastApiError } from "@/lib/toast"
import { uploadMedia } from "@/services/mediaService"
import {
  CompressionToggle,
  DEFAULT_COMPRESSION_SETTINGS,
  type CompressionSettings,
} from "@/components/shared/compression-toggle"
import {
  compressFileForUpload,
  compressionSettingsToOptions,
} from "@/lib/image-compression"

type Slot = ServiceGalleryMediaFormValues

/**
 * Per-slot editor for the service gallery — the "patch" path for changing a
 * slot after it was added: swap the media URL, set/replace the video poster
 * (upload / URL / auto frame capture), and edit alt text. Changes land in the
 * form array; the normal service PUT persists them.
 */
export function ServiceGallerySlotDialog({
  open,
  onOpenChange,
  slot,
  saving = false,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: Slot | null
  /** true while the parent persists the patch — blocks double-saves. */
  saving?: boolean
  onSave: (patch: Partial<Slot>) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<Slot | null>(slot)
  const [posterUploading, setPosterUploading] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [posterProgress, setPosterProgress] = useState<number | null>(null)
  const [compressSettings, setCompressSettings] =
    useState<CompressionSettings>(DEFAULT_COMPRESSION_SETTINGS)
  const compressOptions = compressSettings.enabled
    ? compressionSettingsToOptions(compressSettings)
    : null
  const posterInputRef = useRef<HTMLInputElement>(null)
  const openedKeyRef = useRef<string | null>(null)

  // Re-seed the draft each time a different slot opens the dialog.
  useEffect(() => {
    if (!open) {
      openedKeyRef.current = null
      return
    }
    const key = slot?.clientKey ?? null
    if (!key || openedKeyRef.current === key) return
    openedKeyRef.current = key
    setDraft(slot ? { ...slot } : null)
  }, [open, slot])

  if (!draft) return null

  const isVideo = draft.type === "VIDEO"
  const cleanUrl = extractIframeSrc(draft.url)
  const providerPoster = isVideo
    ? youtubeThumb(cleanUrl) ??
      (extractVimeoId(cleanUrl) ? vimeoPosterUrl(extractVimeoId(cleanUrl)!) : null)
    : null

  function patch(p: Partial<Slot>) {
    setDraft((d) => (d ? { ...d, ...p } : d))
  }

  function onUrlChange(raw: string) {
    // Accept pasted <iframe …> embed code — store only the src.
    if (isIframeMarkup(raw)) {
      const src = extractIframeSrc(raw)
      patch({ url: src })
      return
    }
    patch({ url: raw })
  }

  async function uploadPosterFile(file: File) {
    setPosterUploading(true)
    setPosterProgress(0)
    try {
      const processed = await compressFileForUpload(file, compressOptions)
      const result = await uploadMedia(processed, "services", setPosterProgress)
      patch({ posterUrl: result.fileUrl })
    } catch (err) {
      toastApiError(err, NS.gallery.posterFailed)
    } finally {
      setPosterUploading(false)
      setPosterProgress(null)
    }
  }

  async function captureFromVideo() {
    const url = cleanUrl.trim()
    if (!url) return
    setCapturing(true)
    try {
      const frame = await captureVideoFrame({ kind: "url", url })
      if (!frame) {
        toast.error(NS.gallery.captureUnsupported)
        return
      }
      setPosterUploading(true)
      const processed = await compressFileForUpload(frame, compressOptions)
      const result = await uploadMedia(processed, "services")
      patch({ posterUrl: result.fileUrl })
    } catch (err) {
      toastApiError(err, NS.gallery.captureFailed)
    } finally {
      setCapturing(false)
      setPosterUploading(false)
    }
  }

  const canCapture =
    isVideo && isDirectVideoFile(cleanUrl) && !capturing && !posterUploading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{NS.gallery.slotSettings}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-muted/30 border-border relative aspect-video overflow-hidden rounded-lg border">
            {isVideo ? (
              cleanUrl ? (
                <VideoUrlPreview
                  url={cleanUrl}
                  poster={draft.posterUrl?.trim() || providerPoster}
                  className="size-full"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                  {NS.gallery.noUrl}
                </div>
              )
            ) : cleanUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cleanUrl}
                alt={draft.alt ?? ""}
                className="size-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                {NS.gallery.noUrl}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{NS.gallery.url}</Label>
            <Input
              dir="ltr"
              className="font-mono text-xs"
              placeholder="https://… یان کۆدی iframe"
              value={draft.url ?? ""}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          </div>

          {isVideo ? (
            <div className="space-y-2">
              <Label className="text-xs">{NS.gallery.posterUrl}</Label>
              <div className="flex items-start gap-3">
                {/* Poster preview */}
                <div className="bg-muted/40 border-border relative aspect-video w-36 shrink-0 overflow-hidden rounded-md border">
                  {draft.posterUrl?.trim() || providerPoster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.posterUrl?.trim() || providerPoster!}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                      <PhotoIcon className="size-6 opacity-40" />
                    </div>
                  )}
                  {posterUploading || capturing ? (
                    <div className="bg-background/70 absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3">
                      <span className="text-xs">
                        {capturing
                          ? NS.gallery.capturing
                          : NS.gallery.uploading}
                      </span>
                      {posterUploading ? (
                        <UploadProgressLine
                          value={posterProgress}
                          className="w-full"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void uploadPosterFile(f)
                      e.target.value = ""
                    }}
                  />
                  <CompressionToggle
                    value={compressSettings}
                    onChange={setCompressSettings}
                    disabled={posterUploading || capturing}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      disabled={posterUploading || capturing}
                      onClick={() => posterInputRef.current?.click()}
                    >
                      <ArrowUpTrayIcon className="size-3.5" />
                      {NS.gallery.posterUpload}
                    </Button>
                    {canCapture ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => void captureFromVideo()}
                      >
                        <SparklesIcon className="size-3.5" />
                        {NS.gallery.posterCapture}
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    dir="ltr"
                    className="h-8 font-mono text-xs"
                    placeholder={`${NS.gallery.posterUrl} — https://…`}
                    value={draft.posterUrl ?? ""}
                    onChange={(e) => patch({ posterUrl: e.target.value })}
                  />
                  {providerPoster && !draft.posterUrl?.trim() ? (
                    <p className="text-muted-foreground text-[11px]">
                      {NS.gallery.posterAuto}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label className="text-xs">{NS.gallery.alt}</Label>
            <Input
              value={draft.alt ?? ""}
              onChange={(e) => patch({ alt: e.target.value })}
              placeholder={NS.gallery.altPlaceholder}
            />
          </div>
        </div>

        <DialogFooter className={cn("flex-row justify-between gap-2 sm:justify-between")}>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              onDelete()
              onOpenChange(false)
            }}
          >
            {NS.action.delete}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => {
                onSave({ ...draft, url: cleanUrl })
                onOpenChange(false)
              }}
            >
              {NS.action.save}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
