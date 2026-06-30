"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext, type FieldValues, type Path } from "react-hook-form"

import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEmptyGalleryItem } from "@/types/media-gallery"
import type { MediaKind } from "@/types/media-gallery"

const KIND_LABELS: Record<MediaKind, string> = {
  IMAGE: "وێنە",
  VIDEO: "ڤیدیۆ",
  AUDIO: "دەنگ",
}

type MediaGalleryEditorProps<T extends FieldValues> = {
  name: Path<T>
  title?: string
  addLabel?: string
  emptyLabel?: string
}

export function MediaGalleryEditor<T extends FieldValues>({
  name,
  title = "گالەری میدیا",
  addLabel = "زیادکردنی میدیا",
  emptyLabel = "هیچ میدیایەک زیاد نەکراوە",
}: MediaGalleryEditorProps<T>) {
  const { control, register, setValue, watch } = useFormContext<T>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  })

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={() =>
            append(createEmptyGalleryItem(fields.length) as never)
          }
        >
          <PlusIcon className="size-3.5" />
          {addLabel}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const kind = watch(`${name}.${index}.kind` as Path<T>) as MediaKind
            const url = watch(`${name}.${index}.url` as Path<T>) as string
            return (
              <div
                key={field.id}
                className="border-border bg-muted/10 space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={() => remove(index)}
                    aria-label="سڕینەوە"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs">جۆر</Label>
                    <Select
                      value={kind ?? "IMAGE"}
                      onValueChange={(v) =>
                        setValue(
                          `${name}.${index}.kind` as Path<T>,
                          v as never,
                          { shouldDirty: true },
                        )
                      }
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(KIND_LABELS) as MediaKind[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {KIND_LABELS[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">ڕیزبندی</Label>
                    <Input
                      type="number"
                      min={0}
                      className="mt-1 h-9 font-mono"
                      {...register(`${name}.${index}.sortOrder` as Path<T>, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <MediaCoverUpload
                  label="URL ی میدیا"
                  previewUrl={url?.trim() || null}
                  urlValue={url ?? ""}
                  onUrlChange={(s) =>
                    setValue(`${name}.${index}.url` as Path<T>, s as never, {
                      shouldDirty: true,
                    })
                  }
                  accept={
                    kind === "VIDEO"
                      ? "video/*"
                      : kind === "AUDIO"
                        ? "audio/*"
                        : "image/jpeg,image/png,image/webp,image/gif"
                  }
                  aspectClass={
                    kind === "AUDIO" ? "aspect-square max-w-[200px]" : "aspect-video"
                  }
                />

                {kind === "VIDEO" || kind === "AUDIO" ? (
                  <div>
                    <Label className="text-xs">وێنەی بچووک (thumbnail)</Label>
                    <Input
                      className="mt-1 h-9 text-xs"
                      dir="ltr"
                      placeholder="https://…"
                      {...register(`${name}.${index}.thumbnailUrl` as Path<T>)}
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Input
                    placeholder="سەردێڕی سۆرانی"
                    {...register(`${name}.${index}.captionCkb` as Path<T>)}
                  />
                  <Input
                    placeholder="سەردێڕی کورمانجی"
                    {...register(`${name}.${index}.captionKmr` as Path<T>)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
