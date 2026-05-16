"use client"

import { CloudArrowUpIcon, PhotoIcon } from "@heroicons/react/24/outline"
import * as React from "react"

import { NS } from "@/components/projects/projects-strings"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX = 5 * 1024 * 1024

export function ProjectCoverUpload({
  file,
  previewUrl,
  urlValue,
  onFileChange,
  onUrlChange,
  urlError,
}: {
  file: File | null
  previewUrl: string | null
  urlValue: string
  onFileChange: (f: File | null) => void
  onUrlChange: (s: string) => void
  urlError?: string
}) {
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
    maxSize: MAX,
    accept: ACCEPT,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      clearErrors()
      onUrlChange("")
      onFileChange(entry.file)
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const hasImage = Boolean(preview)

  function handleRemove() {
    clearFiles()
    clearErrors()
    onFileChange(null)
    onUrlChange("")
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative aspect-[21/9] overflow-hidden rounded-xl border transition-colors",
          isDragging
            ? "border-primary border-dashed bg-primary/5"
            : hasImage
              ? "border-border"
              : "border-muted-foreground/25 border-dashed bg-muted/30",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps({ accept: ACCEPT })} className="sr-only" />
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview!} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
              <Button type="button" size="sm" variant="outline" onClick={openFileDialog}>
                {NS.action.change}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleRemove}>
                {NS.action.remove_cover}
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="flex size-full flex-col items-center justify-center gap-2 p-6"
            onClick={openFileDialog}
          >
            <CloudArrowUpIcon className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">{NS.field.cover_drop}</p>
            <p className="text-muted-foreground text-xs">{NS.field.cover_helper}</p>
          </button>
        )}
      </div>

      {errors.length > 0 ? (
        <p className="text-destructive text-xs">{errors[0]}</p>
      ) : null}

      <Collapsible>
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <Button variant="ghost" size="xs" type="button">
              {NS.action.use_url_instead}
            </Button>
          }
        />
        <CollapsibleContent className="pt-2">
          <Input
            dir="ltr"
            className="font-mono text-xs"
            value={urlValue}
            onChange={(e) => {
              clearErrors()
              onUrlChange(e.target.value)
              if (e.target.value.trim()) {
                clearFiles()
                onFileChange(null)
              }
            }}
            placeholder="https://…"
          />
        </CollapsibleContent>
      </Collapsible>

      {urlError ? <FieldError className="text-xs">{urlError}</FieldError> : null}
    </div>
  )
}
