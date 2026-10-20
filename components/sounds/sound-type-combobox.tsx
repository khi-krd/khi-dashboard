"use client"

import { useMemo, useState } from "react"
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  useCreateSoundTypeMutation,
  useSoundTypesQuery,
} from "@/hooks/useTaxonomy"
import { cn } from "@/lib/utils"

/**
 * Sound-type picker backed by the managed /api/v1/sound-tracks/types
 * vocabulary — like the project-type combobox. Still lets the editor type a
 * brand-new name; the backend auto-registers it into the vocabulary on save.
 */
export function SoundTypeCombobox({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const typesQ = useSoundTypesQuery()
  const createMut = useCreateSoundTypeMutation()

  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")

  const items = useMemo(
    () =>
      (typesQ.data ?? [])
        .filter((t) => t.nameCkb.trim())
        .map((t) => ({ ckb: t.nameCkb.trim(), kmr: t.nameKmr }))
        .sort((a, b) => a.ckb.localeCompare(b.ckb, "ckb")),
    [typesQ.data],
  )

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs uppercase">
        {NS.section.type}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-start font-normal",
                error && "border-destructive",
              )}
            >
              {value.trim() ? (
                <span className="truncate">{value}</span>
              ) : (
                <span className="text-muted-foreground">
                  {NS.field.sound_type_helper}
                </span>
              )}
              <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent dir="rtl" className="w-[var(--anchor-width)] p-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={NS.field.sound_type_helper}
            className="h-9"
          />
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {typesQ.isLoading ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">…</p>
            ) : null}
            {items.map((t) => (
              <button
                key={t.ckb}
                type="button"
                className={cn(
                  "hover:bg-muted w-full rounded-md px-2 py-1.5 text-start text-sm",
                  value === t.ckb && "bg-muted",
                )}
                onClick={() => {
                  onChange(t.ckb)
                  setOpen(false)
                }}
              >
                <span className="block">{t.ckb}</span>
                {t.kmr && t.kmr !== t.ckb ? (
                  <span className="text-muted-foreground block text-xs">
                    {t.kmr}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-1"
            onClick={() => setShowCreate((v) => !v)}
          >
            <PlusIcon className="size-4" />
            {NS.action.add_type}
          </Button>
          {showCreate ? (
            <div className="border-border mt-2 space-y-2 border-t pt-2">
              <Input
                placeholder="سۆرانی"
                value={draftCkb}
                onChange={(e) => setDraftCkb(e.target.value)}
              />
              <Input
                placeholder="Kurmancî"
                dir="ltr"
                value={draftKmr}
                onChange={(e) => setDraftKmr(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={createMut.isPending}
                onClick={() => {
                  const ckb = draftCkb.trim()
                  if (!ckb) return
                  const kmr = draftKmr.trim()
                  createMut.mutate(
                    { nameCkb: ckb, nameKmr: kmr || undefined },
                    {
                      onSuccess: () => {
                        toast.success(NS.toast.saved)
                      },
                    },
                  )
                  onChange(ckb)
                  setDraftCkb("")
                  setDraftKmr("")
                  setShowCreate(false)
                  setOpen(false)
                }}
              >
                {NS.action.add}
              </Button>
            </div>
          ) : null}
          <p className="text-muted-foreground mt-2 text-xs">
            {NS.field.sound_type_helper}
          </p>
        </PopoverContent>
      </Popover>
      <FieldError>{error}</FieldError>
    </div>
  )
}
