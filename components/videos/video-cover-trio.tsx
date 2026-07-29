"use client"

import { useObjectUrl } from "@/hooks/use-object-url"
import { VideoCoverSlot } from "@/components/videos/video-cover-slot"
import { NS } from "@/components/videos/videos-strings"
import type { Language } from "@/types/videos"

export function VideoCoverTrio({
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <VideoCoverSlot
          label={NS.cover.ckb}
          inactive={!hasCkb}
          file={ckbCoverFile}
          previewUrl={ckbPreview}
          urlValue={ckbCoverUrl}
          onFileChange={onCkbFileChange}
          onUrlChange={onCkbUrlChange}
        />
        <VideoCoverSlot
          label={NS.cover.kmr}
          inactive={!hasKmr}
          file={kmrCoverFile}
          previewUrl={kmrPreview}
          urlValue={kmrCoverUrl}
          onFileChange={onKmrFileChange}
          onUrlChange={onKmrUrlChange}
        />
        <VideoCoverSlot
          label={NS.cover.hover}
          isHoverSlot
          file={hoverCoverFile}
          previewUrl={hoverPreview}
          urlValue={hoverCoverUrl}
          onFileChange={onHoverFileChange}
          onUrlChange={onHoverUrlChange}
        />
      </div>
    </section>
  )
}
