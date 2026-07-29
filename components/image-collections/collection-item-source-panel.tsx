"use client"

import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useEffect, useState } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { NS } from "@/components/image-collections/collections-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useObjectUrl } from "@/hooks/use-object-url"
import { applyImageFileMeta } from "@/lib/image-album-utils"
import { cn } from "@/lib/utils"
import type { ImageItemFormValues } from "@/lib/validations/image-collections"

type SourceMode = "file" | "external" | "embed"

export function CollectionItemSourcePanel({
  item,
  onChange,
  sourceError,
}: {
  item: ImageItemFormValues
  onChange: (patch: Partial<ImageItemFormValues>) => void
  sourceError?: string
}) {
  const [mode, setMode] = useState<SourceMode>("file")
  const staged = item.stagedBinary
  const localPreview = useObjectUrl(staged)

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
    maxSize: 20 * 1024 * 1024,
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      const file = entry?.file
      if (!file || !(file instanceof File)) return
      void applyImageFileMeta(file).then((meta) => {
        onChange({
          stagedBinary: file,
          imageUrl: "",
          externalUrl: "",
          embedUrl: "",
          ...meta,
        })
      })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const preview =
    localPreview ||
    item.imageUrl?.trim() ||
    item.externalUrl?.trim() ||
    item.embedUrl?.trim() ||
    ""

  return (
    <div className="space-y-3">
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
        <div
          className={cn(
            "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors",
            isDragging && "border-primary bg-primary/5",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input {...getInputProps()} className="sr-only" />
          {preview ? (
            <div className="relative aspect-[4/3] w-full max-w-sm">
              <Image
                src={preview}
                alt=""
                fill
                className="rounded-lg object-contain"
                unoptimized={!isOptimizableImageSrc(preview)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={openFileDialog}
              className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-sm"
            >
              <CloudArrowUpIcon className="size-10 opacity-50" />
              {NS.field.single_drop}
            </button>
          )}
          {preview ? (
            <button
              type="button"
              className="text-primary mt-3 text-xs underline"
              onClick={openFileDialog}
            >
              {NS.action.change}
            </button>
          ) : null}
        </div>
      ) : mode === "external" ? (
        <Input
          dir="ltr"
          value={item.externalUrl ?? ""}
          onChange={(e) =>
            onChange({ externalUrl: e.target.value, imageUrl: "", embedUrl: "" })
          }
          placeholder="https://"
          className="font-mono text-xs"
        />
      ) : (
        <Input
          dir="ltr"
          value={item.embedUrl ?? ""}
          onChange={(e) =>
            onChange({ embedUrl: e.target.value, imageUrl: "", externalUrl: "" })
          }
          placeholder="https://"
          className="font-mono text-xs"
        />
      )}

      <FieldError>{sourceError}</FieldError>
      {uploadErrors[0] ? (
        <p className="text-destructive text-xs">{uploadErrors[0]}</p>
      ) : null}
    </div>
  )
}
