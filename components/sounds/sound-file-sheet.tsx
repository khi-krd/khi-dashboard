"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { SoundFileBrochures } from "@/components/sounds/sound-file-brochures"
import { SoundSourcePanel } from "@/components/sounds/sound-source-panel"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatBytes, formatDuration } from "@/lib/sound-format"
import type {
  SoundFileFormValues,
  SoundFormValues,
} from "@/lib/validations/sounds"

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
          <div className="space-y-2">
            <Label className="text-xs">{NS.col.title}</Label>
            <Input
              value={draft.title ?? ""}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={NS.field.file_title_placeholder}
            />
          </div>

          <SoundSourcePanel file={draft} onChange={patch} />

          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {NS.section.technical}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.duration}</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    className="h-8"
                    value={draft.durationSeconds ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                      patch({ durationSeconds: v === "" ? 0 : Number(v) })
                    }}
                  />
                  <span className="text-muted-foreground text-xs">{NS.field.duration_unit}</span>
                </div>
                <p className="text-muted-foreground font-mono text-[10px]">
                  {formatDuration(draft.durationSeconds)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.size}</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-8"
                  value={draft.sizeBytes ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    patch({ sizeBytes: v === "" ? 0 : Number(v) })
                  }}
                />
                <p className="text-muted-foreground font-mono text-[10px]">
                  {formatBytes(draft.sizeBytes)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.bit_rate}</Label>
                <Input
                  className="h-8"
                  value={draft.bitRate ?? ""}
                  onChange={(e) => patch({ bitRate: e.target.value })}
                  placeholder={NS.field.bit_rate_placeholder}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.sample_rate}</Label>
                <Input
                  className="h-8"
                  value={draft.sampleRate ?? ""}
                  onChange={(e) => patch({ sampleRate: e.target.value })}
                  placeholder={NS.field.sample_rate_placeholder}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.audio_channel}</Label>
                <Select
                  value={draft.audioChannel ?? "STEREO"}
                  onValueChange={(v) =>
                    patch({ audioChannel: v === "MONO" ? "MONO" : "STEREO" })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STEREO">{NS.channel.stereo}</SelectItem>
                    <SelectItem value="MONO">{NS.channel.mono}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.col.type}</Label>
                <Input
                  className="h-8 font-mono text-xs"
                  value={draft.fileFormat ?? ""}
                  onChange={(e) => patch({ fileFormat: e.target.value })}
                />
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
                  type="number"
                  min={1900}
                  max={2100}
                  className="h-8"
                  value={draft.publishmentYear ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    patch({ publishmentYear: v === "" ? null : Number(v) })
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.form}</Label>
                <Input
                  className="h-8"
                  value={draft.form ?? ""}
                  onChange={(e) => patch({ form: e.target.value })}
                  placeholder={NS.field.form_placeholder}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{NS.field.genre}</Label>
                <Input
                  className="h-8"
                  value={draft.genre ?? ""}
                  onChange={(e) => patch({ genre: e.target.value })}
                  placeholder={NS.field.genre_placeholder}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">{NS.field.recording_venue}</Label>
                <Input
                  className="h-8"
                  value={draft.recordingVenue ?? ""}
                  onChange={(e) => patch({ recordingVenue: e.target.value })}
                  placeholder={NS.field.recording_venue_placeholder}
                />
              </div>
            </div>
          </section>

          <SoundFileBrochures
            brochures={draft.brochures ?? []}
            onChange={(brochures) => patch({ brochures })}
          />
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
