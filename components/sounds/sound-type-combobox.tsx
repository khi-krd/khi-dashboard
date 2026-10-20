"use client"

import { useMemo, useState } from "react"
import {
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
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
 * Multi-select sound-type picker backed by the managed
 * /api/v1/sound-tracks/types vocabulary. Each selected value is a chip; a
 * brand-new name can be typed and added, and the backend auto-registers it
 * into the vocabulary on save.
 */
export function SoundTypeCombobox({
  values,
  onChange,
  error,
}: {
  values: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  const typesQ = useSoundTypesQuery()
  const createMut = useCreateSoundTypeMutation()

  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")
  const [typed, setTyped] = useState("")

  const items = useMemo(
    () =>
      (typesQ.data ?? [])
        .filter((t) => t.nameCkb.trim())
        .map((t) => ({ ckb: t.nameCkb.trim(), kmr: t.nameKmr }))
        .sort((a, b) => a.ckb.localeCompare(b.ckb, "ckb")),
    [typesQ.data],
  )

  const addValue = (v: string) => {
    const t = v.trim()
    if (!t) return
    if (!values.some((x) => x === t)) onChange([...values, t])
  }
  const removeValue = (v: string) =>
    onChange(values.filter((x) => x !== v))

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs uppercase">
        {NS.section.type}
      </Label>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              {v}
              <button
                type="button"
                onClick={() => removeValue(v)}
                aria-label="×"
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
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
              {values.length > 0 ? (
                <span className="truncate">{values.length}</span>
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
          <div className="flex gap-1.5">
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={NS.field.sound_type_helper}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addValue(typed)
                  setTyped("")
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 shrink-0"
              onClick={() => {
                addValue(typed)
                setTyped("")
              }}
            >
              {NS.action.add}
            </Button>
          </div>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {typesQ.isLoading ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">…</p>
            ) : null}
            {items.map((t) => {
              const checked = values.includes(t.ckb)
              return (
                <button
                  key={t.ckb}
                  type="button"
                  className={cn(
                    "hover:bg-muted flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                    checked && "bg-muted",
                  )}
                  onClick={() =>
                    checked ? removeValue(t.ckb) : addValue(t.ckb)
                  }
                >
                  <CheckIcon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      checked ? "text-primary opacity-100" : "opacity-0",
                    )}
                  />
                  <span>
                    <span className="block">{t.ckb}</span>
                    {t.kmr && t.kmr !== t.ckb ? (
                      <span className="text-muted-foreground block text-xs">
                        {t.kmr}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
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
                  addValue(ckb)
                  setDraftCkb("")
                  setDraftKmr("")
                  setShowCreate(false)
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
