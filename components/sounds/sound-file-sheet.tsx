"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"


import { SoundFileBrochures } from "@/components/sounds/sound-file-brochures"
import { SoundSourcePanel } from "@/components/sounds/sound-source-panel"
import { NS } from "@/components/sounds/sounds-strings"
import {
  DurationInput,
  useMetaText,
} from "@/components/videos/video-metadata-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type {
  SoundFileFormValues,
  SoundFormValues,
} from "@/lib/validations/sounds"

/** File size is stored in bytes; the editor works in MB. */
function SizeBytesInput({
  value,
  onChange,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  const { text, onText } = useMetaText(
    value && value > 0 ? value : null,
    (bytes) => String(Math.round((bytes / 1048576) * 100) / 100),
    (t) => {
      const mb = parseFloat(t)
      return Number.isFinite(mb) && mb >= 0 ? Math.round(mb * 1048576) : null
    },
    onChange,
  )
  return (
    <Input
      dir="ltr"
      inputMode="decimal"
      className="h-8 font-mono text-xs"
      placeholder="0"
      value={text}
      onChange={(e) => onText(e.target.value)}
    />
  )
}

export function SoundFileSheet({
  open,
  onOpenChange,
  index,
  file,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  index: number
  file: SoundFileFormValues | null
  onSave: (file: SoundFileFormValues) => void
  onDelete: () => void
}) {
  const { control } = useFormContext<SoundFormValues>()
  const { update } = useFieldArray({ control, name: "files" })
  const [draft, setDraft] = useState<SoundFileFormValues | null>(file)
  const draftRef = useRef<SoundFileFormValues | null>(file)
  const openedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    if (!open) {
      openedKeyRef.current = null
      return
    }
    if (!file) return
    const key = file.clientKey
    if (openedKeyRef.current === key) return
    openedKeyRef.current = key
    const next = { ...file }
    draftRef.current = next
    setDraft(next)
  }, [open, index, file, file?.clientKey])

  const patch = useCallback(
    (p: Partial<SoundFileFormValues>) => {
      const current = draftRef.current
      if (!current) return

      const changed = (Object.keys(p) as (keyof SoundFileFormValues)[]).some(
        (key) => current[key] !== p[key],
      )
      if (!changed) return

      const next = { ...current, ...p }
      draftRef.current = next
      setDraft(next)
      update(index, next)
    },
    [index, update],
  )

  if (!draft) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>{NS.file.sheet_title(String(index + 1))}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">
                {NS.col.title} · {NS.lang.ckb}
              </Label>
              <Input
                value={draft.titleCkb ?? draft.title ?? ""}
                onChange={(e) => patch({ titleCkb: e.target.value })}
                placeholder={NS.field.file_title_placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                {NS.col.title} · {NS.lang.kmr}
              </Label>
              <Input
                value={draft.titleKmr ?? ""}
                onChange={(e) => patch({ titleKmr: e.target.value })}
                placeholder={NS.field.file_title_placeholder}
                dir="ltr"
              />
            </div>
          </div>

          <SoundSourcePanel file={draft} onChange={patch} />

          {/*
            Technical metadata auto-fills from a staged file (browser probe,
            re-verified server-side with ffprobe on upload). For link/embed
            sources there is nothing to probe, so every field stays editable —
            manual values are the server's documented fallback.
          */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {NS.section.technical}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.duration}</Label>
                <DurationInput
                  value={draft.durationSeconds}
                  onChange={(v) => patch({ durationSeconds: v ?? 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  {NS.field.size} ({NS.field.size_unit_mb})
                </Label>
                <SizeBytesInput
                  value={draft.sizeBytes}
                  onChange={(v) => patch({ sizeBytes: v ?? 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.bit_rate}</Label>
                <Input
                  dir="ltr"
                  className="h-8 font-mono text-xs"
                  placeholder={NS.field.bit_rate_placeholder}
                  value={draft.bitRate ?? ""}
                  onChange={(e) => patch({ bitRate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.sample_rate}</Label>
                <Input
                  dir="ltr"
                  className="h-8 font-mono text-xs"
                  placeholder={NS.field.sample_rate_placeholder}
                  value={draft.sampleRate ?? ""}
                  onChange={(e) => patch({ sampleRate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.audio_channel}</Label>
                <div className="bg-muted/50 inline-flex rounded-lg p-0.5">
                  {(["STEREO", "MONO"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => patch({ audioChannel: ch })}
                      className={cn(
                        "rounded-md px-3 py-1 font-mono text-xs transition-colors",
                        (draft.audioChannel ?? "STEREO") === ch
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground",
                      )}
                    >
                      {ch === "MONO" ? NS.channel.mono : NS.channel.stereo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {NS.section.content_meta}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.publishment_year}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="h-8"
                  value={draft.publishmentYear ?? ""}
                  onChange={(e) => {
                    // Kurdish/Arabic-Indic digits (٠-٩ / ۰-۹) typed into a
                    // number input either get rejected or produce NaN — the
                    // year silently never reached the API. Normalize to ASCII.
                    const ascii = e.target.value.replace(
                      /[٠-٩۰-۹]/g,
                      (d) =>
                        String(
                          "٠١٢٣٤٥٦٧٨٩".indexOf(d) >= 0
                            ? "٠١٢٣٤٥٦٧٨٩".indexOf(d)
                            : "۰۱۲۳۴۵۶۷۸۹".indexOf(d),
                        ),
                    )
                    const digits = ascii.replace(/\D/g, "")
                    patch({
                      publishmentYear:
                        digits === "" ? null : parseInt(digits, 10),
                    })
                  }}
                />
              </div>
            </div>
            {/* Each language is fully independent — nothing is shared or
                copied between the Sorani and Kurmanji values. */}
            {(
              [
                ["formCkb", "formKmr", NS.field.form, NS.field.form_placeholder],
                ["genreCkb", "genreKmr", NS.field.genre, NS.field.genre_placeholder],
                [
                  "recordingVenueCkb",
                  "recordingVenueKmr",
                  NS.field.recording_venue,
                  NS.field.recording_venue_placeholder,
                ],
              ] as const
            ).map(([ckbKey, kmrKey, label, placeholder]) => (
              <div key={ckbKey} className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {label} · {NS.lang.ckb}
                  </Label>
                  <Input
                    className="h-8"
                    value={draft[ckbKey] ?? ""}
                    onChange={(e) => patch({ [ckbKey]: e.target.value })}
                    placeholder={placeholder}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    {label} · {NS.lang.kmr}
                  </Label>
                  <Input
                    className="h-8"
                    dir="ltr"
                    value={draft[kmrKey] ?? ""}
                    onChange={(e) => patch({ [kmrKey]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </section>

          <section>
            <SoundFileBrochures
              brochures={draft.brochures ?? []}
              onChange={(next) => patch({ brochures: next })}
            />
          </section>
        </div>
        <SheetFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
            {NS.file.delete}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave(draft)
                onOpenChange(false)
              }}
            >
              {NS.action.save}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
