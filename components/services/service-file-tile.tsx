"use client"

import {
  ArrowsPointingOutIcon,
  Bars2Icon,
  PencilSquareIcon,
  PlayIcon,
  PlusIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { fileMetadataBadge } from "@/components/services/service-media-type-badge"
import { NS } from "@/components/services/services-strings"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { ServiceCollectionFileDto, ServiceMediaType } from "@/types/services"

export function ServiceFileTile({
  file,
  mediaType,
  editable = false,
  uploadPending,
  uploadError,
  onClick,
  onEdit,
  onDelete,
  dragHandleProps,
}: {
  file?: ServiceCollectionFileDto
  mediaType: ServiceMediaType
  editable?: boolean
  uploadPending?: boolean
  uploadError?: string | null
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}) {
  const caption =
    file?.ckbContent?.caption?.trim() ||
    file?.kmrContent?.caption?.trim() ||
    ""
  const meta = file ? fileMetadataBadge(file, mediaType) : null

  return (
    <div
      className={cn(
        "group border-border relative aspect-square cursor-pointer overflow-hidden rounded-lg border",
        uploadError && "border-destructive",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.()
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {mediaType === "IMAGE" && file?.fileUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.fileUrl} alt="" className="size-full object-cover" />
      ) : mediaType === "VIDEO" ? (
        file?.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnailUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-muted flex size-full items-center justify-center">
            <PlayIcon className="text-foreground size-10 opacity-80" />
          </div>
        )
      ) : (
        <div className="bg-muted relative flex size-full flex-col items-center justify-center">
          <SpeakerWaveIcon className="text-muted-foreground size-10" />
          <div
            className="absolute inset-x-2 bottom-3 flex h-6 items-end gap-0.5 opacity-30"
            aria-hidden
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-primary/60 flex-1 rounded-sm"
                style={{ height: `${20 + (i % 4) * 15}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {uploadPending ? (
        <div className="bg-background/80 absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
          <Spinner className="size-5" />
          <span className="text-muted-foreground text-[10px]">
            {NS.upload.pending}
          </span>
        </div>
      ) : null}

      {uploadError ? (
        <div className="bg-destructive/10 absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
          <span className="text-destructive text-[10px]">{uploadError}</span>
        </div>
      ) : null}

      {meta ? (
        <span className="bg-background/80 text-foreground pointer-events-none absolute start-1.5 top-1.5 rounded px-1 py-0.5 font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
          {meta}
        </span>
      ) : null}

      {caption ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent px-2 pb-2 pt-6">
          <p className="text-foreground/90 line-clamp-2 text-xs">{caption}</p>
        </div>
      ) : null}

      <ArrowsPointingOutIcon className="text-foreground pointer-events-none absolute end-1.5 top-1.5 size-4 opacity-0 transition-opacity group-hover:opacity-70" />

      {editable ? (
        <div
          className="absolute end-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {dragHandleProps ? (
            <button
              type="button"
              className="bg-background/90 rounded p-1"
              {...dragHandleProps}
            >
              <Bars2Icon className="size-3.5" />
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              className="bg-background/90 rounded p-1"
              onClick={onEdit}
            >
              <PencilSquareIcon className="size-3.5" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="bg-background/90 text-destructive rounded p-1"
              onClick={onDelete}
            >
              <TrashIcon className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function AddFileTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed transition-colors"
    >
      <PlusIcon className="text-muted-foreground size-6" />
      <span className="text-muted-foreground text-xs">{NS.action.add_file}</span>
    </button>
  )
}
