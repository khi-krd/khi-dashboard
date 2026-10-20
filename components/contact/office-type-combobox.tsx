"use client"

import { useMemo, useState } from "react"
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { NS } from "@/components/contact/contact-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  useCreateOfficeTypeMutation,
  useOfficeTypesQuery,
} from "@/hooks/useTaxonomy"
import { cn } from "@/lib/utils"

/**
 * Office-type picker backed by the managed /api/v1/contact/office-types
 * vocabulary. Still accepts arbitrary text — the backend auto-registers new
 * names into the vocabulary when the contact page is saved.
 */
export function OfficeTypeCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const typesQ = useOfficeTypesQuery()
  const createMut = useCreateOfficeTypeMutation()

  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")

  const items = useMemo(
    () =>
      (typesQ.data ?? [])
        .filter((t) => t.nameCkb.trim())
        .sort((a, b) => a.nameCkb.localeCompare(b.nameCkb, "ckb")),
    [typesQ.data],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full justify-between rounded-md px-3 text-start font-normal"
          >
            {value.trim() ? (
              <span className="truncate">{value}</span>
            ) : (
              <span className="text-muted-foreground">
                {NS.form.office_type}
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
          placeholder={NS.form.office_type}
          className="h-9"
        />
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
          {typesQ.isLoading ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">…</p>
          ) : null}
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn(
                "hover:bg-muted w-full rounded-md px-2 py-1.5 text-start text-sm",
                value === t.nameCkb && "bg-muted",
              )}
              onClick={() => {
                onChange(t.nameCkb)
                setOpen(false)
              }}
            >
              <span className="block">{t.nameCkb}</span>
              {t.nameKmr && t.nameKmr !== t.nameCkb ? (
                <span className="text-muted-foreground block text-xs">
                  {t.nameKmr}
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
          {NS.form.office_type_add}
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
              {NS.action.save}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
