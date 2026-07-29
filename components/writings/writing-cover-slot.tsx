"use client"

import { EyeIcon, PhotoIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { NS } from "@/components/writings/writings-strings"
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

export function WritingCoverSlot({
  label,
  helper,
  isHoverSlot,
  inactive,
  previewUrl,
  urlValue,
  onFileChange,
  onUrlChange,
  urlError,
}: {
  label: string
  helper?: string
  isHoverSlot?: boolean
  inactive?: boolean
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

  function handleRemove() {
    clearFiles()
    clearErrors()
    onFileChange(null)
    onUrlChange("")
  }

  return (
    <div
      className={cn(
        "relative space-y-2",
        inactive && "pointer-events-none opacity-50",
      )}
    >
      <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        {isHoverSlot ? (
          <EyeIcon className="text-muted-foreground size-3.5" aria-hidden />
        ) : null}
        {label}
      </p>
      <div
        className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-lg border border-dashed transition-colors",
          isHoverSlot ? "border-primary/30 bg-primary/5" : "border-border",
          isDragging && "border-primary bg-primary/5",
        )}
        onDragEnter={inactive ? undefined : handleDragEnter}
        onDragLeave={inactive ? undefined : handleDragLeave}
        onDragOver={inactive ? undefined : handleDragOver}
        onDrop={inactive ? undefined : handleDrop}
      >
        <input {...getInputProps()} className="sr-only" disabled={inactive} />
        {preview ? (
          <>
            <Image
              src={preview}
              alt=""
              fill
              className="object-cover"
              unoptimized={!isOptimizableImageSrc(preview)}
            />
            <div className="absolute inset-x-0 top-0 flex justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                className="text-xs text-white underline-offset-2 hover:underline"
                onClick={openFileDialog}
              >
                {NS.action.change}
              </button>
              <button
                type="button"
                className="text-destructive text-xs underline-offset-2 hover:underline"
                onClick={handleRemove}
              >
                {NS.action.delete}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-xs"
            onClick={openFileDialog}
            disabled={inactive}
          >
            <PhotoIcon className="size-8 opacity-40" aria-hidden />
            <span>{helper ?? NS.cover.helper}</span>
          </button>
        )}
      </div>
      {isHoverSlot ? (
        <p className="text-muted-foreground text-[10px]">{NS.cover.hover_long_hint}</p>
      ) : null}
      <Collapsible>
        <CollapsibleTrigger className="text-muted-foreground text-xs underline-offset-2 hover:underline">
          {NS.action.use_url_instead}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Input
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://"
            className="h-8 text-xs"
            disabled={inactive}
          />
          <FieldError>{urlError}</FieldError>
        </CollapsibleContent>
      </Collapsible>
      {errors.length > 0 ? (
        <p className="text-destructive text-xs">{errors[0]}</p>
      ) : null}
    </div>
  )
}
