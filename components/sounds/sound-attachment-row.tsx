"use client"

import { TrashIcon } from "@heroicons/react/24/outline"

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
import type { AttachmentFormValues } from "@/lib/validations/sounds"
import type { AttachmentType } from "@/types/sounds"

const ATTACHMENT_TYPES: AttachmentType[] = [
  "PDF",
  "VIDEO",
  "IMAGE",
  "AUDIO",
  "OTHER",
]

export function SoundAttachmentRow({
  attachment,
  onChange,
  onRemove,
}: {
  attachment: AttachmentFormValues
  onChange: (patch: Partial<AttachmentFormValues>) => void
  onRemove: () => void
}) {
  const [, { getInputProps, openFileDialog, removeFile }] = useFileUpload({
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      onChange({
        stagedAttachmentFile: entry.file,
        fileUrl: "",
        mimeType: entry.file.type,
        sizeBytes: entry.file.size,
        attachmentType: guessAttachmentTypeFromMime(entry.file.type),
      })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  const fileLabel =
    attachment.stagedAttachmentFile?.name ||
    attachment.fileUrl?.trim() ||
    NS.attachment.no_title

  return (
    <li className="border-border grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <div className="space-y-2 sm:col-span-1">
        <div className="space-y-1">
          <Label className="text-xs">{NS.col.title}</Label>
          <Input
            value={attachment.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
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
          value={attachment.fileUrl ?? ""}
          onChange={(e) =>
            onChange({ fileUrl: e.target.value, stagedAttachmentFile: null })
          }
          placeholder="https://"
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{NS.col.type}</Label>
        <Select
          value={attachment.attachmentType ?? "OTHER"}
          onValueChange={(v) =>
            onChange({ attachmentType: (v as AttachmentType) ?? "OTHER" })
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
    </li>
  )
}
