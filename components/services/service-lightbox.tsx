"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ServiceCollectionFileDto, ServiceMediaType } from "@/types/services"

export function ServiceLightbox({
  open,
  onOpenChange,
  file,
  mediaType,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: ServiceCollectionFileDto | null
  mediaType: ServiceMediaType
}) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto p-2">
        <DialogTitle className="sr-only">media preview</DialogTitle>
        {mediaType === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.fileUrl}
            alt=""
            className="mx-auto max-h-[85vh] w-auto rounded-lg object-contain"
          />
        ) : mediaType === "VIDEO" ? (
          <video
            src={file.fileUrl}
            controls
            poster={file.thumbnailUrl ?? undefined}
            className="mx-auto max-h-[85vh] w-full rounded-lg"
          />
        ) : (
          <audio src={file.fileUrl} controls className="w-full" />
        )}
      </DialogContent>
    </Dialog>
  )
}
