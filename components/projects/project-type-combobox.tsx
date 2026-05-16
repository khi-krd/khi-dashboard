"use client"

import { useState } from "react"
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/projects/projects-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ProjectTypeOption } from "@/types/projects"

export function ProjectTypeCombobox({
  items,
  valueCkb,
  valueKmr,
  onChange,
}: {
  items: ProjectTypeOption[]
  valueCkb: string
  valueKmr: string
  onChange: (ckb: string, kmr: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")

  const display = valueCkb.trim() || valueKmr.trim()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-start font-normal"
          >
            {display ? (
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate">{valueCkb || NS.dash}</span>
                {valueKmr ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {valueKmr}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-muted-foreground">{NS.filter.all_types}</span>
            )}
            <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent dir="rtl" className="w-[var(--anchor-width)] p-2">
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {items.map((t) => (
            <button
              key={t.projectTypeCkb}
              type="button"
              className={cn(
                "hover:bg-muted w-full rounded-md px-2 py-1.5 text-start text-sm",
                valueCkb === t.projectTypeCkb && "bg-muted",
              )}
              onClick={() => {
                onChange(t.projectTypeCkb, t.projectTypeKmr)
                setOpen(false)
              }}
            >
              <span className="block">{t.projectTypeCkb}</span>
              {t.projectTypeKmr ? (
                <span className="text-muted-foreground block text-xs">
                  {t.projectTypeKmr}
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
              onClick={() => {
                if (!draftCkb.trim()) return
                onChange(draftCkb.trim(), draftKmr.trim())
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
        <p className="text-muted-foreground mt-2 text-xs">{NS.field.type_helper}</p>
      </PopoverContent>
    </Popover>
  )
}
