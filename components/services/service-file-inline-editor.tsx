"use client"

import { TrashIcon } from "@heroicons/react/24/outline"
import { useFormContext } from "react-hook-form"

import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import type { ServiceFormValues } from "@/lib/validations/services"
import type { ServiceMediaType } from "@/types/services"
import { cn } from "@/lib/utils"

export function ServiceFileInlineEditor({
  collectionIndex,
  fileIndex,
  mediaType,
  onRemove,
  onOpenSheet,
}: {
  collectionIndex: number
  fileIndex: number
  mediaType: ServiceMediaType
  onRemove: () => void
  onOpenSheet?: () => void
}) {
  const { watch, setValue } = useFormContext<ServiceFormValues>()
  const base = `mediaCollections.${collectionIndex}.files.${fileIndex}` as const
  const file = watch(base)
  const contentLanguages = watch("contentLanguages")
  const showKmr = contentLanguages.includes("KMR")
  const preview = file?.thumbnailUrl?.trim() || file?.fileUrl?.trim() || null

  return (
    <div className="border-border bg-muted/20 mt-4 space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{NS.file.editInline}</span>
        <div className="flex gap-1">
          {onOpenSheet ? (
            <Button type="button" variant="ghost" size="sm" onClick={onOpenSheet}>
              {NS.file.openSheet}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={onRemove}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
        <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          {preview && (mediaType === "IMAGE" || mediaType === "VIDEO") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-mono text-[10px]">
                {NS.field.thumbnailUrl}
              </Label>
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={file?.thumbnailUrl ?? ""}
                onChange={(e) =>
                  setValue(`${base}.thumbnailUrl`, e.target.value, {
                    shouldDirty: true,
                  })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-mono text-[10px]">
                {NS.field.fileUrl}
              </Label>
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={file?.fileUrl ?? ""}
                onChange={(e) =>
                  setValue(`${base}.fileUrl`, e.target.value, {
                    shouldDirty: true,
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs">
              {NS.file.titleCkb}
              <span
                className={cn(
                  "text-primary border-primary/20 bg-primary/10 rounded border px-1 py-0.5 text-[10px] font-medium",
                )}
              >
                {NS.lang.ckbShort}
              </span>
            </Label>
            <Input
              value={file?.ckbContent?.title ?? ""}
              onChange={(e) =>
                setValue(
                  `${base}.ckbContent`,
                  {
                    ...file?.ckbContent,
                    title: e.target.value,
                  },
                  { shouldDirty: true },
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{NS.file.captionCkb}</Label>
            <Input
              value={file?.ckbContent?.caption ?? ""}
              onChange={(e) =>
                setValue(
                  `${base}.ckbContent`,
                  {
                    ...file?.ckbContent,
                    caption: e.target.value,
                  },
                  { shouldDirty: true },
                )
              }
              placeholder={NS.file.captionPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{NS.file.descriptionCkb}</Label>
            <TiptapEditor
              toolbar="compact"
              lang="CKB"
              contentMinHeightClass="min-h-[120px]"
              placeholder={NS.field.bodyCkb}
              value={file?.ckbContent?.description ?? ""}
              onChange={(html) =>
                setValue(
                  `${base}.ckbContent`,
                  {
                    ...file?.ckbContent,
                    description: html,
                  },
                  { shouldDirty: true },
                )
              }
            />
          </div>

          {showKmr ? (
            <>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-xs">
                  {NS.file.titleKmr}
                  <span
                    className={cn(
                      "text-primary border-primary/20 bg-primary/10 rounded border px-1 py-0.5 text-[10px] font-medium",
                    )}
                  >
                    {NS.lang.kmrShort}
                  </span>
                </Label>
                <Input
                  dir="ltr"
                  value={file?.kmrContent?.title ?? ""}
                  onChange={(e) =>
                    setValue(
                      `${base}.kmrContent`,
                      {
                        ...file?.kmrContent,
                        title: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{NS.file.captionKmr}</Label>
                <Input
                  dir="ltr"
                  value={file?.kmrContent?.caption ?? ""}
                  onChange={(e) =>
                    setValue(
                      `${base}.kmrContent`,
                      {
                        ...file?.kmrContent,
                        caption: e.target.value,
                      },
                      { shouldDirty: true },
                    )
                  }
                  placeholder={NS.file.captionPlaceholder}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{NS.file.descriptionKmr}</Label>
                <TiptapEditor
                  toolbar="compact"
                  lang="KMR"
                  contentMinHeightClass="min-h-[120px]"
                  placeholder={NS.field.bodyKmr}
                  value={file?.kmrContent?.description ?? ""}
                  onChange={(html) =>
                    setValue(
                      `${base}.kmrContent`,
                      {
                        ...file?.kmrContent,
                        description: html,
                      },
                      { shouldDirty: true },
                    )
                  }
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
