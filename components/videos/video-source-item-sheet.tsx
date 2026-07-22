"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CloudUploadIcon,
} from "@hugeicons/core-free-icons"
import { useEffect, useState } from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { VideoMetadataGrid } from "@/components/videos/video-metadata-grid"
import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useFileUpload } from "@/hooks/use-file-upload"
import { applyVideoFileMeta } from "@/lib/video-file-utils"
import { watchToEmbedUrl } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

const MAX_VIDEO_FILE_BYTES = 500 * 1024 * 1024

type Source = VideoFormValues["videoSources"][number]
type SourceMode = "file" | "external" | "embed"

export function VideoSourceItemSheet({
  open,
  onOpenChange,
  source,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  source: Source | null
  onSave: (source: Source) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<Source | null>(source)
  const [mode, setMode] = useState<SourceMode>("file")
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    if (source) {
      setDraft({ ...source })
      if (source.externalUrl?.trim()) setMode("external")
      else if (source.embedUrl?.trim()) setMode("embed")
      else setMode("file")
    }
  }, [source, open])

  useEffect(() => {
    const staged = draft?.stagedVideoFile
    if (!staged) {
      setLocalPreview(null)
      return
    }
    const u = URL.createObjectURL(staged)
    setLocalPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [draft?.stagedVideoFile])

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
      removeFile,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_VIDEO_FILE_BYTES,
    accept: "video/*",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      const file = entry.file
      patch({ stagedVideoFile: file })
      void applyVideoFileMeta(file).then((meta) => {
        patch({
          stagedVideoFile: file,
          durationSeconds: meta.durationSeconds,
          fileSizeMb: meta.fileSizeMb,
          fileFormat: meta.fileFormat,
          resolution: meta.resolution,
        })
      })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  if (!draft) return null

  function patch(p: Partial<Source>) {
    setDraft((d) => (d ? { ...d, ...p } : d))
  }

  function clearStagedFile() {
    clearFiles()
    patch({ stagedVideoFile: null })
  }

  const playbackUrl = localPreview || draft.url?.trim() || undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{NS.source.sheet_title(String(draft.label || 1))}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="source-label">{NS.source.label_field}</FieldLabel>
              <Input
                id="source-label"
                value={draft.label ?? ""}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder={NS.source.label_placeholder}
              />
            </Field>

            <Field orientation="horizontal">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="source-main">{NS.source.main_label}</FieldLabel>
                <FieldDescription>{NS.source.main_helper}</FieldDescription>
              </div>
              <Switch
                id="source-main"
                checked={!!draft.main}
                onCheckedChange={(checked) => patch({ main: checked })}
              />
            </Field>
          </FieldGroup>

          <div className="bg-muted/50 inline-flex w-full rounded-lg p-1">
            {(
              [
                ["file", NS.source.mode.file],
                ["external", NS.source.mode.external],
                ["embed", NS.source.mode.embed],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "file" ? (
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "relative flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed transition-colors",
                  isDragging && "border-primary bg-primary/5",
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input {...getInputProps()} className="sr-only" />
                {playbackUrl ? (
                  <video
                    src={playbackUrl}
                    controls
                    className="size-full rounded-xl object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-muted-foreground flex flex-col items-center gap-2 p-6 text-sm"
                  >
                    <HugeiconsIcon
                      icon={CloudUploadIcon}
                      strokeWidth={2}
                      className="size-10 opacity-50"
                    />
                    {NS.source.file_drop}
                  </button>
                )}
              </div>
              {draft.stagedVideoFile ? (
                <div className="flex gap-3 text-xs">
                  <span>{draft.stagedVideoFile.name}</span>
                  <button
                    type="button"
                    className="underline"
                    onClick={openFileDialog}
                  >
                    {NS.action.change}
                  </button>
                  <button
                    type="button"
                    className="text-destructive underline"
                    onClick={clearStagedFile}
                  >
                    {NS.action.remove_cover}
                  </button>
                </div>
              ) : null}
              <p className="text-muted-foreground text-xs">
                {NS.source.file_helper}
              </p>
              <Field>
                <FieldLabel>{NS.source.s3_helper}</FieldLabel>
                <Input
                  value={draft.url ?? ""}
                  onChange={(e) => patch({ url: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              {uploadErrors.length > 0 ? (
                <Alert variant="destructive">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
                  <AlertTitle>هەڵەی بارکردن</AlertTitle>
                  <AlertDescription>{uploadErrors[0]}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}

          {mode === "external" ? (
            <Field>
              <FieldLabel>{NS.source.mode.external}</FieldLabel>
              <Input
                value={draft.externalUrl ?? ""}
                onChange={(e) => patch({ externalUrl: e.target.value })}
                placeholder={NS.field.external_placeholder}
              />
            </Field>
          ) : null}

          {mode === "embed" ? (
            <Field>
              <FieldLabel>{NS.source.mode.embed}</FieldLabel>
              <Input
                value={draft.embedUrl ?? ""}
                onChange={(e) => patch({ embedUrl: e.target.value })}
                placeholder={NS.field.embed_placeholder}
              />
            </Field>
          ) : null}

          {mode !== "file" ? (
            <VideoPlayerBlock
              source={{
                url: draft.url,
                externalUrl: draft.externalUrl,
                embedUrl:
                  draft.embedUrl ||
                  watchToEmbedUrl(draft.externalUrl ?? "") ||
                  undefined,
                fileFormat: draft.fileFormat,
              }}
            />
          ) : null}

          <p className="text-muted-foreground text-xs">
            {NS.source.metadata_manual}
          </p>
          <VideoMetadataGrid
            durationSeconds={draft.durationSeconds}
            resolution={draft.resolution ?? ""}
            fileFormat={draft.fileFormat ?? ""}
            fileSizeMb={draft.fileSizeMb}
            onDurationChange={(n) => patch({ durationSeconds: n })}
            onResolutionChange={(s) => patch({ resolution: s })}
            onFormatChange={(s) => patch({ fileFormat: s })}
            onSizeChange={(n) => patch({ fileSizeMb: n })}
          />
        </div>
        <SheetFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={onDelete}
          >
            {NS.source.delete}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave(draft)
                onOpenChange(false)
              }}
            >
              {NS.action.save}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
