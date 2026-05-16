"use client"

import { useFormContext } from "react-hook-form"

import { NS } from "@/components/projects/projects-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ProjectFormValues } from "@/lib/validations/projects"
import type { ProjectMediaType } from "@/types/projects"
import {
  extractYoutubeId,
  extractVimeoId,
} from "@/components/projects/project-media-helpers"

const MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "PDF",
  "DOCUMENT",
] as const satisfies readonly ProjectMediaType[]

export function ProjectMediaSheet({
  index,
  open,
  onOpenChange,
  onDelete,
}: {
  index: number | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onDelete: () => void
}) {
  const { register, watch, setValue, formState } = useFormContext<ProjectFormValues>()
  const errors = formState.errors.mediaItems?.[index ?? 0]

  if (index == null) return null

  const idx = index
  const mediaType = watch(`mediaItems.${idx}.mediaType`) as ProjectMediaType
  const caption = watch(`mediaItems.${idx}.caption`) ?? ""
  const capLen = caption.length

  function autoEmbed() {
    const ext = watch(`mediaItems.${idx}.externalUrl`) ?? ""
    const yt = extractYoutubeId(ext)
    if (yt) {
      setValue(`mediaItems.${idx}.embedUrl`, `https://www.youtube.com/embed/${yt}`)
      return
    }
    const vm = extractVimeoId(ext)
    if (vm) {
      setValue(`mediaItems.${idx}.embedUrl`, `https://player.vimeo.com/video/${vm}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle>{NS.section.media}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>جۆری میدیا</Label>
            <Select
              value={mediaType}
              onValueChange={(v) =>
                setValue(`mediaItems.${idx}.mediaType`, v as ProjectMediaType, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {MEDIA_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input dir="ltr" className="font-mono text-xs" {...register(`mediaItems.${idx}.url`)} />
            {errors?.url?.message ? (
              <FieldError>{String(errors.url.message)}</FieldError>
            ) : null}
          </div>

          {(mediaType === "VIDEO" || mediaType === "AUDIO") && (
            <>
              <div className="space-y-2">
                <Label>{NS.action.add_link}</Label>
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  {...register(`mediaItems.${idx}.externalUrl`)}
                />
              </div>
              <div className="space-y-2">
                <Label>Embed URL</Label>
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  {...register(`mediaItems.${idx}.embedUrl`)}
                />
                <Button type="button" variant="outline" size="sm" onClick={autoEmbed}>
                  {NS.action.embed_helper}
                </Button>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>{NS.field.caption}</Label>
            <Input
              maxLength={255}
              placeholder={NS.field.caption_placeholder}
              {...register(`mediaItems.${idx}.caption`)}
            />
            <p className="text-muted-foreground text-xs">
              {formatCkbDigits(capLen)}/255
            </p>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {NS.action.cancel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            {NS.action.delete}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {NS.action.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
