"use client"

import { useEffect, useRef, useState } from "react"

import { NS } from "@/components/videos/videos-strings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDuration, parseDuration } from "@/lib/video-format"

function MetaValue({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-muted/50 flex h-8 items-center rounded-md px-2 font-mono text-xs">
      {children ?? "—"}
    </p>
  )
}

export type VideoMetadataPatch = {
  durationSeconds?: number | null
  resolution?: string
  fileFormat?: string
  fileSizeMb?: number | null
}

/**
 * A technical-metadata value that edits as free text while staying in sync
 * with outside (auto-probe) updates: the text is seeded from `display`, and
 * re-seeded whenever `committed` changes to something we didn't just send.
 */
export function useMetaText(
  committed: number | null | undefined,
  display: (v: number) => string,
  parse: (text: string) => number | null,
  commit: (v: number | null) => void,
) {
  const [text, setText] = useState(() =>
    committed != null ? display(committed) : "",
  )
  const lastSent = useRef(committed)
  useEffect(() => {
    if (committed === lastSent.current) return
    lastSent.current = committed
    setText(committed != null ? display(committed) : "")
  }, [committed, display])

  return {
    text,
    onText: (next: string) => {
      setText(next)
      const parsed = next.trim() === "" ? null : parse(next)
      if (parsed != null || next.trim() === "") {
        lastSent.current = parsed
        commit(parsed)
      }
    },
  }
}

export function DurationInput({
  value,
  onChange,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  const { text, onText } = useMetaText(
    value,
    formatDuration,
    parseDuration,
    onChange,
  )
  return (
    <Input
      dir="ltr"
      inputMode="numeric"
      className="h-8 font-mono text-xs"
      placeholder="00:00"
      value={text}
      onChange={(e) => onText(e.target.value)}
    />
  )
}

export function SizeInput({
  value,
  onChange,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  const { text, onText } = useMetaText(
    value,
    (v) => String(v),
    (t) => {
      const n = parseFloat(t)
      return Number.isFinite(n) && n >= 0 ? n : null
    },
    onChange,
  )
  return (
    <Input
      dir="ltr"
      inputMode="decimal"
      className="h-8 font-mono text-xs"
      placeholder={NS.field.size_unit}
      value={text}
      onChange={(e) => onText(e.target.value)}
    />
  )
}

/**
 * Technical metadata — editable so link/embed sources (which the server can't
 * probe) can carry ماوە/پاژەکی/فۆرمات/Size too. Staged files still auto-fill:
 * the probe patch flows in through the same props and re-seeds the inputs.
 * Without `onChange` it stays a read-only display (detail views).
 */
export function VideoMetadataGrid({
  durationSeconds,
  resolution,
  fileFormat,
  fileSizeMb,
  onChange,
}: {
  durationSeconds: number | null | undefined
  resolution: string
  fileFormat: string
  fileSizeMb: number | null | undefined
  onChange?: (patch: VideoMetadataPatch) => void
}) {
  const editable = onChange != null
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {NS.section.technical}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.duration}</Label>
          {editable ? (
            <DurationInput
              value={durationSeconds}
              onChange={(v) => onChange({ durationSeconds: v })}
            />
          ) : (
            <MetaValue>{formatDuration(durationSeconds ?? null)}</MetaValue>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.resolution}</Label>
          {editable ? (
            <Input
              dir="ltr"
              className="h-8 font-mono text-xs"
              placeholder="1080p"
              value={resolution}
              onChange={(e) => onChange({ resolution: e.target.value })}
            />
          ) : (
            <MetaValue>{resolution || null}</MetaValue>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.format}</Label>
          {editable ? (
            <Input
              dir="ltr"
              className="h-8 font-mono text-xs uppercase"
              placeholder="MP4"
              value={fileFormat}
              onChange={(e) => onChange({ fileFormat: e.target.value })}
            />
          ) : (
            <MetaValue>{fileFormat || null}</MetaValue>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.size}</Label>
          {editable ? (
            <SizeInput
              value={fileSizeMb}
              onChange={(v) => onChange({ fileSizeMb: v })}
            />
          ) : (
            <MetaValue>
              {fileSizeMb != null ? `${fileSizeMb} ${NS.field.size_unit}` : null}
            </MetaValue>
          )}
        </div>
      </div>
    </div>
  )
}
