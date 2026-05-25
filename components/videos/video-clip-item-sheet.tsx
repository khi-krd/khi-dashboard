"use client"

import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

import { VideoMetadataGrid } from "@/components/videos/video-metadata-grid"
import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useFileUpload } from "@/hooks/use-file-upload"
import { applyVideoFileMeta } from "@/lib/video-file-utils"
import { watchToEmbedUrl } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

const MAX_VIDEO_FILE_BYTES = 500 * 1024 * 1024

type Clip = VideoFormValues["videoClipItems"][number]
type SourceMode = "file" | "external" | "embed"

export function VideoClipItemSheet({
  open,
  onOpenChange,
  clip,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  clip: Clip | null
  onSave: (clip: Clip) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<Clip | null>(clip)
  const [mode, setMode] = useState<SourceMode>("file")
  const [tab, setTab] = useState<"CKB" | "KMR">("CKB")
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    if (clip) setDraft({ ...clip })
  }, [clip, open])

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

  function patch(p: Partial<Clip>) {
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
          <SheetTitle>
            {NS.clip.sheet_title(String(draft.clipNumber ?? 1))}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="bg-muted/50 inline-flex rounded-lg p-1">
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
                  "rounded-md px-2 py-1 text-xs",
                  mode === m && "bg-background shadow-sm",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "file" ? (
            <div className="space-y-3">
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
                    <CloudArrowUpIcon className="size-10 opacity-50" />
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
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{NS.source.s3_helper}</p>
                <Input
                  value={draft.url ?? ""}
                  onChange={(e) => patch({ url: e.target.value })}
                  placeholder="https://"
                />
              </div>
              {uploadErrors[0] ? (
                <p className="text-destructive text-xs">{uploadErrors[0]}</p>
              ) : null}
            </div>
          ) : null}
          {mode === "external" ? (
            <Input
              value={draft.externalUrl ?? ""}
              onChange={(e) => patch({ externalUrl: e.target.value })}
              placeholder={NS.field.external_placeholder}
            />
          ) : null}
          {mode === "embed" ? (
            <Input
              value={draft.embedUrl ?? ""}
              onChange={(e) => patch({ embedUrl: e.target.value })}
              placeholder={NS.field.embed_placeholder}
            />
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
          <div className="flex gap-4 border-b border-border/60">
            {(["CKB", "KMR"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setTab(code)}
                className={cn(
                  "-mb-px pb-2 text-sm",
                  tab === code
                    ? "border-primary border-b-2 font-medium"
                    : "text-muted-foreground",
                )}
              >
                {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            ))}
          </div>
          {tab === "CKB" ? (
            <>
              <Input
                value={draft.titleCkb ?? ""}
                onChange={(e) => patch({ titleCkb: e.target.value })}
                placeholder={NS.field.title_ckb}
              />
              <TiptapEditor
                lang="CKB"
                contentMinHeightClass="min-h-[160px]"
                placeholder={NS.field.body_ckb}
                value={draft.descriptionCkb ?? ""}
                onChange={(html) => patch({ descriptionCkb: html })}
              />
            </>
          ) : (
            <>
              <Input
                value={draft.titleKmr ?? ""}
                onChange={(e) => patch({ titleKmr: e.target.value })}
                placeholder={NS.field.title_kmr}
              />
              <TiptapEditor
                lang="KMR"
                contentMinHeightClass="min-h-[160px]"
                placeholder={NS.field.body_kmr}
                value={draft.descriptionKmr ?? ""}
                onChange={(html) => patch({ descriptionKmr: html })}
              />
            </>
          )}
          <p className="text-muted-foreground text-xs">
            {NS.clip.metadata_manual}
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
          <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
            {NS.clip.delete}
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
