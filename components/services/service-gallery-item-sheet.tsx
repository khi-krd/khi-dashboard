"use client"

import { useEffect, useState } from "react"

import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import {
  Field,
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
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceGalleryMediaFormValues } from "@/lib/validations/services"

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|$)/i

function detectTypeFromUrl(url: string): "IMAGE" | "VIDEO" {
  return VIDEO_EXT.test(url.trim()) ? "VIDEO" : "IMAGE"
}

export function ServiceGalleryItemSheet({
  open,
  onOpenChange,
  index,
  slot,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  index: number
  slot: ServiceGalleryMediaFormValues | null
  onSave: (slot: ServiceGalleryMediaFormValues) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<ServiceGalleryMediaFormValues | null>(slot)

  useEffect(() => {
    if (slot) setDraft({ ...slot })
  }, [slot, open])

  if (!draft) return null

  function patch(p: Partial<ServiceGalleryMediaFormValues>) {
    setDraft((d) => (d ? { ...d, ...p } : d))
  }

  function setType(type: "IMAGE" | "VIDEO") {
    patch({ type })
  }

  function setUrl(url: string) {
    const type = draft?.type ?? detectTypeFromUrl(url)
    patch({
      url,
      type: url.trim() ? detectTypeFromUrl(url) : type,
    })
  }

  const isVideo = draft.type === "VIDEO"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {NS.gallery.sheetTitle(formatCkbDigits(index + 1))}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <div className="bg-muted/50 inline-flex w-full rounded-lg p-1">
            {(
              [
                ["IMAGE", NS.gallery.typeImage],
                ["VIDEO", NS.gallery.typeVideo],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => setType(type)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  draft.type === type
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <MediaCoverUpload
            label={isVideo ? NS.gallery.typeVideo : NS.gallery.typeImage}
            variant={isVideo ? "video" : "image"}
            previewUrl={draft.url?.trim() || null}
            urlValue={draft.url ?? ""}
            onUrlChange={setUrl}
            aspectClass="aspect-video"
            helperText={NS.field.coverHelper}
          />

          {isVideo ? (
            <MediaCoverUpload
              label={NS.gallery.posterUrl}
              variant="image"
              previewUrl={draft.posterUrl?.trim() || null}
              urlValue={draft.posterUrl ?? ""}
              onUrlChange={(v) => patch({ posterUrl: v })}
              aspectClass="aspect-video"
            />
          ) : null}

          <Field>
            <FieldLabel htmlFor="gallery-alt">{NS.gallery.alt}</FieldLabel>
            <Input
              id="gallery-alt"
              value={draft.alt ?? ""}
              onChange={(e) => patch({ alt: e.target.value })}
              placeholder={NS.gallery.altPlaceholder}
            />
          </Field>
        </div>
        <SheetFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={onDelete}
          >
            {NS.action.delete}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave({
                  ...draft,
                  type: draft.type ?? detectTypeFromUrl(draft.url),
                })
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
