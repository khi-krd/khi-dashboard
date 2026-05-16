"use client"

import {
  AlertCircleIcon,
  CloudUploadIcon,
  ImageIcon,
  MultiplicationSignIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { NS } from "@/components/news/news-strings"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX = 5 * 1024 * 1024

export function NewsCoverUpload({
  file,
  previewUrl,
  urlValue,
  onFileChange,
  onUrlChange,
  urlError,
  layout = "default",
}: {
  file: File | null
  previewUrl: string | null
  urlValue: string
  onFileChange: (f: File | null) => void
  onUrlChange: (s: string) => void
  urlError?: string
  layout?: "default" | "sidebar"
}) {
  const preview = previewUrl?.trim() || null

  /** Pattern from `@/components/examples/c-file-upload-10.tsx`: useFileUpload + 21:9 frame (ReUI alerts, Hugeicons). */
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
    initialFiles: [],
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      clearErrors()
      onUrlChange("")
      onFileChange(entry.file)
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const [imageLoading, setImageLoading] = React.useState(Boolean(preview))
  React.useEffect(() => {
    if (preview) setImageLoading(true)
  }, [preview])

  const hasImage = Boolean(preview)

  function handleRemove() {
    clearFiles()
    clearErrors()
    onFileChange(null)
    onUrlChange("")
    setImageLoading(false)
  }

  return (
    <Field data-invalid={urlError ? "" : undefined}>
      {layout === "default" ? (
        <FieldLabel>{NS.section.cover}</FieldLabel>
      ) : null}

      <div className={layout === "default" ? "mt-2 space-y-3" : "space-y-3"}>
        <div
          className={cn(
            "group border-border rounded-xl relative overflow-hidden border transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 border-dashed"
              : hasImage
                ? "border-border bg-background hover:border-primary/50"
                : "border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5 border-dashed",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input {...getInputProps({ accept: ACCEPT })} className="sr-only" />

          {hasImage ? (
            <>
              <div className="relative aspect-21/9 w-full">
                {imageLoading ? (
                  <div className="bg-muted absolute inset-0 flex animate-pulse items-center justify-center">
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <HugeiconsIcon
                        icon={ImageIcon}
                        strokeWidth={2}
                        className="size-5"
                      />
                      <span className="text-sm">{NS.field.cover_loading}</span>
                    </div>
                  </div>
                ) : null}

                {/* eslint-disable-next-line @next/next/no-img-element -- remote/blob URLs */}
                <img
                  src={preview!}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    imageLoading ? "opacity-0" : "opacity-100",
                  )}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />

                <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 rtl:flex-row-reverse">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openFileDialog()
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} />
                      {NS.action.change}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove()
                      }}
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        strokeWidth={2}
                      />
                      {NS.action.delete}
                    </Button>
                  </div>
                </div>

                {Boolean(file?.name?.trim()) ? (
                  <p
                    dir="ltr"
                    className="absolute bottom-2 inset-s-2 z-2 truncate rounded-md bg-black/50 px-2 py-1 text-[0.65rem] text-white backdrop-blur-sm lg:max-w-[min(100%,420px)]"
                    title={file?.name ?? ""}
                  >
                    {file!.name}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openFileDialog()
                }
              }}
              className="flex aspect-21/9 w-full cursor-pointer flex-col items-center justify-center gap-4 px-6 py-8 text-center"
              onClick={openFileDialog}
            >
              <div className="bg-primary/10 rounded-full p-4">
                <HugeiconsIcon
                  icon={CloudUploadIcon}
                  strokeWidth={2}
                  className="text-primary size-8"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground text-base font-semibold">
                  {NS.section.cover}
                </h3>
                <p className="text-muted-foreground px-2 text-sm leading-relaxed">
                  {NS.field.cover_drop}
                </p>
                <p className="text-muted-foreground text-xs">{NS.field.cover_format_hint}</p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
              >
                <HugeiconsIcon icon={ImageIcon} strokeWidth={2} />
                {NS.action.upload_media_file}
              </Button>
            </div>
          )}
        </div>

        {errors.length > 0 ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertTitle>{NS.error.cover_file_alert}</AlertTitle>
            <AlertDescription>
              <p className="text-destructive-foreground text-sm">{NS.error.cover_file_validation}</p>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <Collapsible className="mt-2">
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <Button variant="ghost" size="xs" type="button" className="rounded-md">
              {NS.field.cover_or_url}
            </Button>
          }
        />
        <CollapsibleContent className="pt-2">
          <Input
            dir="ltr"
            className="h-9 rounded-md text-start font-mono text-xs"
            value={urlValue}
            onChange={(e) => {
              clearErrors()
              const v = e.target.value
              onUrlChange(v)
              if (v.trim()) {
                clearFiles()
                onFileChange(null)
              }
            }}
            placeholder={NS.field.url_example_placeholder}
          />
        </CollapsibleContent>
      </Collapsible>

      {urlError ? (
        <FieldError className="text-xs">{urlError}</FieldError>
      ) : null}
    </Field>
  )
}
