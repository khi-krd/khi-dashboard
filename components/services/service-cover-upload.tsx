"use client"

import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline"

import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFileUpload } from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"

const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4"
const MAX = 20 * 1024 * 1024

export function ServiceCoverUpload({
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

  const hasMedia = Boolean(preview)

  function handleRemove() {
    clearFiles()
    clearErrors()
    onFileChange(null)
    onUrlChange("")
  }

  return (
    <ServiceFormSectionCard
      title={NS.section.coverHero}
      fieldLabel={NS.field.coverMediaUrl}
    >
      <div
        className={cn(
          "relative aspect-[21/9] overflow-hidden rounded-lg border transition-colors",
          isDragging
            ? "border-primary border-dashed bg-primary/5"
            : hasMedia
              ? "border-border"
              : "border-muted-foreground/25 border-dashed bg-muted/30",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps({ accept: ACCEPT })} className="sr-only" />
        {hasMedia ? (
          <>
            {preview!.match(/\.(mp4|webm)$/i) ||
            urlValue.match(/\.(mp4|webm)$/i) ? (
              <video
                src={preview!}
                className="size-full object-cover"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview!} alt="" className="size-full object-cover" />
            )}
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
          <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-6">
            <PhotoIcon className="size-10 opacity-40" />
            <span className="text-sm font-medium">{NS.field.coverNotSelected}</span>
            <span className="text-xs opacity-70">{NS.field.coverDrop}</span>
          </div>
        )}
      </div>

      {errors.length > 0 ? <FieldError>{errors[0]}</FieldError> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Button
          type="button"
          variant="default"
          className="shrink-0 gap-2"
          onClick={openFileDialog}
        >
          <ArrowUpTrayIcon className="size-4" />
          {NS.action.upload}
        </Button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label className="text-muted-foreground text-xs">URL</Label>
          <Input
            dir="ltr"
            className="font-mono text-xs"
            placeholder="https://..."
            value={urlValue}
            onChange={(e) => {
              onFileChange(null)
              onUrlChange(e.target.value)
            }}
          />
        </div>
      </div>
      {urlError ? <FieldError>{urlError}</FieldError> : null}
      <p className="text-muted-foreground text-xs">{NS.field.coverHelper}</p>
    </ServiceFormSectionCard>
  )
}
