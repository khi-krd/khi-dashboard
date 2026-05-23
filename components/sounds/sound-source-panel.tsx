"use client"

import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import { useCallback, useEffect, useRef, useState } from "react"

import { NS } from "@/components/sounds/sounds-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import {
  applyAudioFileMeta,
  audioFileMetaFromFile,
  enrichMetaWithSampleRate,
  mergeAudioMetaPatch,
  metaPatchFromAudioElement,
} from "@/lib/sound-audio-utils"
import { cn } from "@/lib/utils"
import type { SoundFileFormValues } from "@/lib/validations/sounds"

type SourceMode = "file" | "external" | "embed"

export function SoundSourcePanel({
  file,
  onChange,
  sourceError,
}: {
  file: SoundFileFormValues
  onChange: (patch: Partial<SoundFileFormValues>) => void
  sourceError?: string
}) {
  const [mode, setMode] = useState<SourceMode>("file")
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const probeGenRef = useRef(0)
  const staged = file.stagedAudioFile

  const applyMetaPatch = useCallback(
    (patch: Partial<SoundFileFormValues>) => {
      if (Object.keys(patch).length === 0) return
      onChange(patch)
    },
    [onChange],
  )

  useEffect(() => {
    if (!staged) {
      setLocalPreview(null)
      return
    }
    const u = URL.createObjectURL(staged)
    setLocalPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [staged])

  useEffect(() => {
    if (!staged) return
    const gen = ++probeGenRef.current
    applyMetaPatch(audioFileMetaFromFile(staged))
    void applyAudioFileMeta(staged).then((meta) => {
      if (probeGenRef.current !== gen) return
      const { title: id3Title, ...rest } = meta
      applyMetaPatch({
        stagedAudioFile: staged,
        fileUrl: "",
        ...rest,
        ...(id3Title && !file.title?.trim() ? { title: id3Title } : {}),
      })
    })
  }, [staged, applyMetaPatch, file.title])

  const syncFromAudioElement = useCallback(() => {
    const el = audioRef.current
    if (!el) return

    const base = metaPatchFromAudioElement(el, {
      stagedFile: staged,
      sizeBytes: file.sizeBytes,
      fileFormat: file.fileFormat ?? undefined,
    })

    if ((base.durationSeconds ?? 0) <= 0 && !base.sizeBytes && !base.bitRate) {
      return
    }

    const apply = (patch: Partial<SoundFileFormValues>) => {
      const merged = mergeAudioMetaPatch(
        {
          durationSeconds: file.durationSeconds ?? 0,
          sizeBytes: file.sizeBytes ?? 0,
          bitRate: file.bitRate ?? undefined,
          sampleRate: file.sampleRate ?? undefined,
          fileFormat: file.fileFormat ?? undefined,
        },
        {
          durationSeconds: patch.durationSeconds,
          sizeBytes: patch.sizeBytes,
          bitRate: patch.bitRate ?? undefined,
          sampleRate: patch.sampleRate ?? undefined,
          fileFormat: patch.fileFormat ?? undefined,
        },
      )
      applyMetaPatch(merged as Partial<SoundFileFormValues>)
    }

    if (staged) {
      void enrichMetaWithSampleRate(base, staged).then(apply)
    } else {
      apply(base)
    }
  }, [
    staged,
    file.sizeBytes,
    file.fileFormat,
    file.durationSeconds,
    file.bitRate,
    file.sampleRate,
    applyMetaPatch,
  ])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onMeta = () => syncFromAudioElement()
    el.addEventListener("loadedmetadata", onMeta)
    el.addEventListener("durationchange", onMeta)

    if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
      queueMicrotask(onMeta)
    }

    return () => {
      el.removeEventListener("loadedmetadata", onMeta)
      el.removeEventListener("durationchange", onMeta)
    }
  }, [localPreview, file.fileUrl, file.externalUrl, file.embedUrl, syncFromAudioElement])

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
    maxSize: 100 * 1024 * 1024,
    accept: "audio/*",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      const audioFile = entry.file
      applyMetaPatch({
        stagedAudioFile: audioFile,
        fileUrl: "",
        ...audioFileMetaFromFile(audioFile),
      })
      const gen = ++probeGenRef.current
      void applyAudioFileMeta(audioFile).then((meta) => {
        if (probeGenRef.current !== gen) return
        const { title: id3Title, ...rest } = meta
        applyMetaPatch({
          stagedAudioFile: audioFile,
          fileUrl: "",
          ...rest,
          ...(id3Title && !file.title?.trim() ? { title: id3Title } : {}),
        })
      })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const playbackSrc =
    localPreview ||
    file.fileUrl?.trim() ||
    file.externalUrl?.trim() ||
    file.embedUrl?.trim() ||
    ""

  return (
    <div className="space-y-3">
      <div className="bg-muted/50 inline-flex flex-wrap rounded-lg p-1">
        {(
          [
            ["file", NS.file.source_file],
            ["external", NS.file.source_external],
            ["embed", NS.file.source_embed],
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
              "relative flex flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors",
              isDragging && "border-primary bg-primary/5",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input {...getInputProps()} className="sr-only" />
            {playbackSrc ? (
              <audio
                ref={audioRef}
                key={playbackSrc}
                src={playbackSrc}
                controls
                className="w-full"
                preload="metadata"
              />
            ) : (
              <button
                type="button"
                onClick={openFileDialog}
                className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-sm"
              >
                <CloudArrowUpIcon className="size-10 opacity-50" />
                {NS.file.source_file}
              </button>
            )}
          </div>
          {staged ? (
            <div className="flex gap-3 text-xs">
              <span>{staged.name}</span>
              <button type="button" className="underline" onClick={openFileDialog}>
                {NS.action.change}
              </button>
              <button
                type="button"
                className="text-destructive underline"
                onClick={() => {
                  clearFiles()
                  probeGenRef.current += 1
                  onChange({ stagedAudioFile: null, fileUrl: "" })
                }}
              >
                {NS.action.delete}
              </button>
            </div>
          ) : (
            <Input
              value={file.fileUrl ?? ""}
              onChange={(e) => onChange({ fileUrl: e.target.value, stagedAudioFile: null })}
              placeholder="https://"
            />
          )}
        </div>
      ) : null}

      {mode === "external" ? (
        <Input
          value={file.externalUrl ?? ""}
          onChange={(e) => onChange({ externalUrl: e.target.value })}
          placeholder="https://"
        />
      ) : null}

      {mode === "embed" ? (
        <Input
          value={file.embedUrl ?? ""}
          onChange={(e) => onChange({ embedUrl: e.target.value })}
          placeholder="https://"
        />
      ) : null}

      {playbackSrc && mode !== "file" ? (
        <audio
          ref={audioRef}
          key={playbackSrc}
          src={playbackSrc}
          controls
          className="w-full"
          preload="metadata"
        />
      ) : null}

      <FieldError>{sourceError}</FieldError>
      {uploadErrors.length > 0 ? (
        <p className="text-destructive text-xs">{uploadErrors[0]}</p>
      ) : null}
    </div>
  )
}
