"use client"

import { NS } from "@/components/image-collections/collections-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ImageItemFormValues } from "@/lib/validations/image-collections"

function hasProbedMetadata(item: ImageItemFormValues): boolean {
  return (
    !!item.stagedBinary ||
    item.widthPx != null ||
    item.fileSizeBytes != null ||
    !!item.mimeType?.trim()
  )
}

export function AlbumItemMetadataSection({ item }: { item: ImageItemFormValues }) {
  if (item.widthPx == null && item.fileSizeBytes == null && !item.mimeType?.trim()) {
    return null
  }

  const aspectLabel =
    item.aspectRatio != null
      ? formatCkbDigits(Number(item.aspectRatio.toFixed(2)))
      : null

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {NS.section.auto_meta}
      </h3>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {item.widthPx != null && item.heightPx != null ? (
          <div>
            <dt className="text-muted-foreground">{NS.meta.dimensions}</dt>
            <dd className="font-mono">
              {formatCkbDigits(item.widthPx)}×{formatCkbDigits(item.heightPx)}
            </dd>
          </div>
        ) : null}
        {item.humanReadableSize || item.fileSizeBytes != null ? (
          <div>
            <dt className="text-muted-foreground">{NS.meta.size}</dt>
            <dd className="font-mono">
              {item.humanReadableSize ??
                (item.fileSizeBytes != null ? `${item.fileSizeBytes} B` : NS.dash)}
            </dd>
          </div>
        ) : null}
        {item.mimeType?.trim() ? (
          <div>
            <dt className="text-muted-foreground">{NS.meta.mime_type}</dt>
            <dd className="font-mono">{item.mimeType}</dd>
          </div>
        ) : null}
        {aspectLabel ? (
          <div>
            <dt className="text-muted-foreground">{NS.meta.aspect_ratio}</dt>
            <dd className="font-mono">{aspectLabel}</dd>
          </div>
        ) : null}
      </dl>
      {hasProbedMetadata(item) ? (
        <p className="text-muted-foreground text-[10px] italic">{NS.meta.auto_tooltip}</p>
      ) : null}
    </section>
  )
}
