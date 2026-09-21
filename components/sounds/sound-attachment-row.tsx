"use client"

import { Bars2Icon, TrashIcon } from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useFormContext } from "react-hook-form"

import { NS } from "@/components/sounds/sounds-strings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFileUpload } from "@/hooks/use-file-upload"
import { guessAttachmentTypeFromMime } from "@/lib/sound-format"
import type { SoundFormValues } from "@/lib/validations/sounds"
import type { AttachmentType } from "@/types/sounds"

const ATTACHMENT_TYPES: AttachmentType[] = [
  "PDF",
  "VIDEO",
  "IMAGE",
  "AUDIO",
  "OTHER",
]

export function SoundAttachmentRow({
  id,
  index,
  onRemove,
}: {
  id: string
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const { register, setValue, watch } = useFormContext<SoundFormValues>()
  const attachment = watch(`attachments.${index}`)
  const base = `attachments.${index}` as const

  const [, { getInputProps, openFileDialog, removeFile }] = useFileUpload({
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      setValue(`${base}.stagedAttachmentFile`, entry.file, { shouldDirty: true })
      setValue(`${base}.fileUrl`, "", { shouldDirty: true })
      setValue(`${base}.mimeType`, entry.file.type, { shouldDirty: true })
      setValue(`${base}.sizeBytes`, entry.file.size, { shouldDirty: true })
      setValue(
        `${base}.attachmentType`,
        guessAttachmentTypeFromMime(entry.file.type),
        { shouldDirty: true },
      )
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const fileLabel =
    attachment.stagedAttachmentFile?.name ||
    attachment.fileUrl?.trim() ||
    NS.attachment.no_title

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border-border bg-background grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
    >
      <div className="space-y-2 sm:col-span-1">
        <div className="space-y-1">
          <Label className="text-xs">{NS.col.title}</Label>
          <Input
            {...register(`${base}.title`)}
            placeholder={NS.field.attachment_title_placeholder}
            className="h-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <input {...getInputProps()} className="sr-only" />
          <button
            type="button"
            className="text-primary text-xs underline-offset-2 hover:underline"
            onClick={openFileDialog}
          >
            {attachment.stagedAttachmentFile ? NS.action.change : NS.action.add}
          </button>
          <span className="text-muted-foreground truncate text-xs">{fileLabel}</span>
        </div>
        <Input
          {...register(`${base}.fileUrl`, {
            onChange: () => {
              setValue(`${base}.stagedAttachmentFile`, null, { shouldDirty: true })
            },
          })}
          placeholder="https://"
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{NS.col.type}</Label>
        <Select
          value={attachment.attachmentType ?? "OTHER"}
          onValueChange={(v) =>
            setValue(`${base}.attachmentType`, (v as AttachmentType) ?? "OTHER", {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger className="h-9 w-full min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ATTACHMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:text-destructive justify-self-end p-2"
        onClick={onRemove}
        aria-label={NS.attachment.delete}
      >
        <TrashIcon className="size-4" />
      </button>
      <button
        type="button"
        className="text-muted-foreground cursor-grab justify-self-end p-2"
        {...attributes}
        {...listeners}
        aria-label={NS.action.reorder}
      >
        <Bars2Icon className="size-4" />
      </button>
    </li>
  )
}
