"use client"

import { useState } from "react"

import { useObjectUrl } from "@/hooks/use-object-url"
import {
  CompressionToggle,
  DEFAULT_COMPRESSION_SETTINGS,
  type CompressionSettings,
} from "@/components/shared/compression-toggle"
import { compressionSettingsToOptions } from "@/lib/image-compression"
import { CollectionCoverSlot } from "@/components/image-collections/collection-cover-slot"
import { NS } from "@/components/image-collections/collections-strings"
import type { Language } from "@/types/image-collections"

export function CollectionCoverTrio({
  contentLanguages,
  ckbCoverFile,
  kmrCoverFile,
  hoverCoverFile,
  ckbCoverUrl,
  kmrCoverUrl,
  hoverCoverUrl,
  existingCkbCoverUrl,
  existingKmrCoverUrl,
  existingHoverCoverUrl,
  onCkbFileChange,
  onKmrFileChange,
  onHoverFileChange,
  onCkbUrlChange,
  onKmrUrlChange,
  onHoverUrlChange,
}: {
  contentLanguages: Language[]
  ckbCoverFile: File | null
  kmrCoverFile: File | null
  hoverCoverFile: File | null
  ckbCoverUrl: string
  kmrCoverUrl: string
  hoverCoverUrl: string
  existingCkbCoverUrl: string | null
  existingKmrCoverUrl: string | null
  existingHoverCoverUrl: string | null
  onCkbFileChange: (f: File | null) => void
  onKmrFileChange: (f: File | null) => void
  onHoverFileChange: (f: File | null) => void
  onCkbUrlChange: (s: string) => void
  onKmrUrlChange: (s: string) => void
  onHoverUrlChange: (s: string) => void
}) {
  const [compressSettings, setCompressSettings] =
    useState<CompressionSettings>(DEFAULT_COMPRESSION_SETTINGS)
  const compressOptions = compressSettings.enabled
    ? compressionSettingsToOptions(compressSettings)
    : null

  const ckbBlob = useObjectUrl(ckbCoverFile)
  const kmrBlob = useObjectUrl(kmrCoverFile)
  const hoverBlob = useObjectUrl(hoverCoverFile)

  const ckbPreview =
    ckbBlob ?? (ckbCoverUrl.trim() || existingCkbCoverUrl?.trim() || null)
  const kmrPreview =
    kmrBlob ?? (kmrCoverUrl.trim() || existingKmrCoverUrl?.trim() || null)
  const hoverPreview =
    hoverBlob ?? (hoverCoverUrl.trim() || existingHoverCoverUrl?.trim() || null)

  const hasCkb = contentLanguages.includes("CKB")
  const hasKmr = contentLanguages.includes("KMR")

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">{NS.section.cover_trio}</h2>
      <CompressionToggle
        value={compressSettings}
        onChange={setCompressSettings}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CollectionCoverSlot
          label={NS.cover.ckb}
          helper={NS.cover.helper}
          inactive={!hasCkb}
          file={ckbCoverFile}
          previewUrl={ckbPreview}
          urlValue={ckbCoverUrl}
          onFileChange={onCkbFileChange}
          onUrlChange={onCkbUrlChange}
        compressOptions={compressOptions}
        />
        <CollectionCoverSlot
          label={NS.cover.kmr}
          helper={NS.cover.helper}
          inactive={!hasKmr}
          file={kmrCoverFile}
          previewUrl={kmrPreview}
          urlValue={kmrCoverUrl}
          onFileChange={onKmrFileChange}
          onUrlChange={onKmrUrlChange}
        compressOptions={compressOptions}
        />
        <CollectionCoverSlot
          label={NS.cover.hover}
          helper={NS.cover.helper}
          highlightedHint={NS.cover.hover_hint}
          isHoverSlot
          file={hoverCoverFile}
          previewUrl={hoverPreview}
          urlValue={hoverCoverUrl}
          onFileChange={onHoverFileChange}
          onUrlChange={onHoverUrlChange}
        compressOptions={compressOptions}
        />
      </div>
    </section>
  )
}
