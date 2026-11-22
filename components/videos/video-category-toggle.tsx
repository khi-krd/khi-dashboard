"use client"

import { ManagedOptionSegments } from "@/components/shared/managed-option-segments"

/** پۆلی ڤیدیۆ — the film/clip toggle's segmented style with a "+" quick-add. */
export function VideoCategoryToggle({
  value,
  onChange,
}: {
  value: number | null
  onChange: (id: number | null) => void
}) {
  return (
    <ManagedOptionSegments
      kind="video-categories"
      value={value}
      onChange={onChange}
    />
  )
}
