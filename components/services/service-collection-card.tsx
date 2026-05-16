"use client"

import { useState } from "react"

import { ServiceFileTile } from "@/components/services/service-file-tile"
import { ServiceLightbox } from "@/components/services/service-lightbox"
import { ServiceMediaTypeBadge, mediaTypeLabel } from "@/components/services/service-media-type-badge"
import { NS } from "@/components/services/services-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type {
  ServiceCollectionFileDto,
  ServiceMediaCollectionDto,
} from "@/types/services"

export function ServiceCollectionCard({
  collection,
}: {
  collection: ServiceMediaCollectionDto
}) {
  const [lightboxFile, setLightboxFile] =
    useState<ServiceCollectionFileDto | null>(null)

  const files = [...(collection.files ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{collection.collectionName}</h3>
          <p className="text-muted-foreground text-xs">
            {mediaTypeLabel(collection.mediaType)} ·{" "}
            {NS.collection.fileCount(formatCkbDigits(files.length))}
          </p>
        </div>
        <ServiceMediaTypeBadge type={collection.mediaType} />
      </div>

      {files.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed p-6 text-center text-sm">
          {NS.collection.emptyFiles}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file, i) => (
            <ServiceFileTile
              key={file.id ?? `${file.fileUrl}-${i}`}
              file={file}
              mediaType={collection.mediaType}
              onClick={() => setLightboxFile(file)}
            />
          ))}
        </div>
      )}

      <ServiceLightbox
        open={lightboxFile != null}
        onOpenChange={(open) => {
          if (!open) setLightboxFile(null)
        }}
        file={lightboxFile}
        mediaType={collection.mediaType}
      />
    </section>
  )
}
