"use client"

import {
  CloudArrowUpIcon,
  MusicalNoteIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"

import { NS } from "@/components/writings/writings-strings"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MAX_UPLOAD_BYTES, useFileUpload } from "@/hooks/use-file-upload"
import { humanReadableSize, urlBasename } from "@/lib/writing-format"
import { cn } from "@/lib/utils"

const AUDIO_ACCEPT = ".mp3,.wav,.m4a,.aac,.ogg,audio/*"
const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,image/*"

/**
 * دەنگی کتێب + وێنەی سی دی — one card per field, each following the cover-trio
 * convention: a staged file wins, a re-sent URL is a no-op, "" clears. The two
 * are fully independent — removing one never touches the other.
 */
export function WritingAudioCdSection({
  audioFile,
  audioUrl,
  cdCoverFile,
  cdCoverUrl,
  onAudioFileChange,
  onAudioUrlChange,
  onCdCoverFileChange,
  onCdCoverUrlChange,
}: {
  audioFile: File | null
  audioUrl: string
  cdCoverFile: File | null
  cdCoverUrl: string
  onAudioFileChange: (f: File | null) => void
  onAudioUrlChange: (s: string) => void
  onCdCoverFileChange: (f: File | null) => void
  onCdCoverUrlChange: (s: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <MediaSlot
        kind="audio"
        label={NS.field.audio_label}
        dropLabel={NS.field.audio_drop}
        helper={NS.field.audio_helper}
        replaceLabel={NS.field.audio_replace}
        removeLabel={NS.field.audio_remove}
        stagedFile={audioFile}
        url={audioUrl}
        onFileChange={onAudioFileChange}
        onUrlChange={onAudioUrlChange}
      />
      <MediaSlot
        kind="image"
        label={NS.field.cd_cover_label}
        dropLabel={NS.field.cd_cover_drop}
        helper={NS.field.cd_cover_helper}
        replaceLabel={NS.field.cd_cover_replace}
        removeLabel={NS.field.cd_cover_remove}
        stagedFile={cdCoverFile}
        url={cdCoverUrl}
        onFileChange={onCdCoverFileChange}
        onUrlChange={onCdCoverUrlChange}
      />
    </div>
  )
}

function MediaSlot({
  kind,
  label,
  dropLabel,
  helper,
  replaceLabel,
  removeLabel,
  stagedFile,
  url,
  onFileChange,
  onUrlChange,
}: {
  kind: "audio" | "image"
  label: string
  dropLabel: string
  helper: string
  replaceLabel: string
  removeLabel: string
  stagedFile: File | null
  url: string
  onFileChange: (f: File | null) => void
  onUrlChange: (s: string) => void
}) {
  const [urlOpen, setUrlOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

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
    maxSize: MAX_UPLOAD_BYTES,
    accept: kind === "audio" ? AUDIO_ACCEPT : IMAGE_ACCEPT,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      onFileChange(entry.file)
      if (kind === "image") {
        setPreviewSrc((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(entry.file as File)
        })
      }
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  // `url` is seeded with the persisted URL on edit, so it alone is the
  // effective value — blanking it must read as "cleared" right away.
  const effectiveUrl = url.trim()
  const hasValue = !!stagedFile || !!effectiveUrl
  const displayName = stagedFile?.name ?? (effectiveUrl ? urlBasename(effectiveUrl) : null)
  const Icon = kind === "audio" ? MusicalNoteIcon : PhotoIcon

  return (
    <div className="border-border space-y-3 rounded-lg border p-4">
      <Label className="text-sm font-medium">{label}</Label>

      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors",
          isDragging && "border-primary bg-primary/5",
          hasValue && "border-solid",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />
        {hasValue ? (
          <div className="flex w-full flex-col items-center gap-2 py-2 text-center">
            {kind === "image" && (previewSrc || effectiveUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc ?? effectiveUrl}
                alt={label}
                className="h-28 w-28 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <Icon className="text-primary size-10 opacity-70" />
            )}
            <p className="max-w-full truncate text-sm font-medium">
              {displayName}
            </p>
            {stagedFile ? (
              <p className="text-muted-foreground text-xs">
                {humanReadableSize(stagedFile.size)}
              </p>
            ) : null}
            {kind === "audio" && effectiveUrl && !stagedFile ? (
                <audio controls preload="metadata" src={effectiveUrl} className="h-9 w-full" />
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <button
                type="button"
                className="text-primary underline"
                onClick={openFileDialog}
              >
                {replaceLabel}
              </button>
              <button
                type="button"
                className="text-destructive underline"
                onClick={() => {
                  onFileChange(null)
                  onUrlChange("")
                  if (kind === "image" && previewSrc) {
                    URL.revokeObjectURL(previewSrc)
                    setPreviewSrc(null)
                  }
                }}
              >
                {removeLabel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFileDialog}
            className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-sm"
          >
            <CloudArrowUpIcon className="size-10 opacity-50" />
            {dropLabel}
          </button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{helper}</p>
      {uploadErrors[0] ? (
        <p className="text-destructive text-xs">{uploadErrors[0]}</p>
      ) : null}

      <Collapsible open={urlOpen} onOpenChange={setUrlOpen}>
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground text-xs underline">
          {NS.action.use_url_instead}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Input
            dir="ltr"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://…"
            className="font-mono text-xs"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
