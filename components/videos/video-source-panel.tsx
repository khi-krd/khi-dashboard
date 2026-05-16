"use client"

import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import { watchToEmbedUrl } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

type SourceMode = "file" | "external" | "embed"

export function VideoSourcePanel() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<VideoFormValues>()

  const sourceUrl = watch("sourceUrl") ?? ""
  const sourceExternalUrl = watch("sourceExternalUrl") ?? ""
  const sourceEmbedUrl = watch("sourceEmbedUrl") ?? ""
  const stagedFile = watch("stagedVideoFile")
  const fileFormat = watch("fileFormat")

  const [mode, setMode] = useState<SourceMode>("file")
  const [embedGenerated, setEmbedGenerated] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!stagedFile) {
      setLocalPreview(null)
      return
    }
    const u = URL.createObjectURL(stagedFile)
    setLocalPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [stagedFile])

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
    maxSize: 500 * 1024 * 1024,
    accept: "video/*",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      setValue("stagedVideoFile", entry.file, { shouldDirty: true })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  function clearStagedFile() {
    clearFiles()
    setValue("stagedVideoFile", null, { shouldDirty: true })
  }

  function autoEmbed() {
    const embed = watchToEmbedUrl(sourceExternalUrl)
    if (embed) {
      setValue("sourceEmbedUrl", embed, { shouldDirty: true })
      setEmbedGenerated(true)
    }
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <h2 className="text-sm font-medium">{NS.section.source}</h2>
      <div className="bg-muted/50 inline-flex flex-wrap rounded-lg p-1">
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
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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
            {localPreview || stagedFile ? (
              <video
                src={localPreview ?? undefined}
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
          {stagedFile ? (
            <div className="flex gap-3 text-xs">
              <span>{stagedFile.name}</span>
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
              value={sourceUrl}
              onChange={(e) =>
                setValue("sourceUrl", e.target.value, { shouldDirty: true })
              }
              placeholder="https://"
            />
          </div>
          {uploadErrors[0] ? (
            <p className="text-destructive text-xs">{uploadErrors[0]}</p>
          ) : null}
        </div>
      ) : null}

      {mode === "external" ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={sourceExternalUrl}
              onChange={(e) => {
                setValue("sourceExternalUrl", e.target.value, {
                  shouldDirty: true,
                })
                setEmbedGenerated(false)
              }}
              placeholder={NS.field.external_placeholder}
            />
            <Button type="button" variant="outline" size="sm" onClick={autoEmbed}>
              {NS.action.auto_embed}
            </Button>
          </div>
          {embedGenerated ? (
            <p className="text-xs text-emerald-600">{NS.source.embed_generated}</p>
          ) : null}
          <VideoPlayerBlock
            source={{
              embedUrl: watchToEmbedUrl(sourceExternalUrl),
              externalUrl: sourceExternalUrl,
            }}
          />
        </div>
      ) : null}

      {mode === "embed" ? (
        <div className="space-y-3">
          <Input
            value={sourceEmbedUrl}
            onChange={(e) =>
              setValue("sourceEmbedUrl", e.target.value, { shouldDirty: true })
            }
            placeholder={NS.field.embed_placeholder}
          />
          <VideoPlayerBlock
            source={{ embedUrl: sourceEmbedUrl, fileFormat }}
          />
        </div>
      ) : null}

      <FieldError>{errors.sourceUrl?.message as string}</FieldError>
    </section>
  )
}
