"use client"

import { useState } from "react"
import {
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

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

export type ProjectTypeValue = { nameCkb: string; nameKmr: string }

/**
 * Multi-select project-type picker backed by the managed project-type
 * vocabulary. Each selection is a bilingual {ckb, kmr} pair shown as a chip.
 */
export function ProjectTypeCombobox({
  items,
  values,
  onChange,
  onCreateInline,
}: {
  items: ProjectTypeOption[]
  values: ProjectTypeValue[]
  onChange: (v: ProjectTypeValue[]) => void
  /** Fired only from the "add type" panel — lets the caller persist the new name into the managed vocabulary. */
  onCreateInline?: (option: ProjectTypeOption) => void
}) {
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")
  const [typed, setTyped] = useState("")

  const addValue = (ckb: string, kmr: string) => {
    const c = ckb.trim()
    if (!c) return
    if (values.some((v) => v.nameCkb === c)) return
    onChange([...values, { nameCkb: c, nameKmr: kmr.trim() }])
  }
  const removeValue = (ckb: string) =>
    onChange(values.filter((v) => v.nameCkb !== ckb))

  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v.nameCkb}
              className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              <span>
                {v.nameCkb}
                {v.nameKmr && v.nameKmr !== v.nameCkb ? (
                  <span className="text-muted-foreground ms-1">
                    ({v.nameKmr})
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={() => removeValue(v.nameCkb)}
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
              className="h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-start font-normal"
            >
              {values.length > 0 ? (
                <span className="truncate">{values.length}</span>
              ) : (
                <span className="text-muted-foreground">
                  {NS.filter.all_types}
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
              placeholder={NS.field.type_helper}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addValue(typed, "")
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
                addValue(typed, "")
                setTyped("")
              }}
            >
              {NS.action.add}
            </Button>
          </div>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {items.map((t) => {
              const checked = values.some(
                (v) => v.nameCkb === t.projectTypeCkb,
              )
              return (
                <button
                  key={t.projectTypeCkb}
                  type="button"
                  className={cn(
                    "hover:bg-muted flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                    checked && "bg-muted",
                  )}
                  onClick={() =>
                    checked
                      ? removeValue(t.projectTypeCkb)
                      : addValue(t.projectTypeCkb, t.projectTypeKmr)
                  }
                >
                  <CheckIcon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      checked ? "text-primary opacity-100" : "opacity-0",
                    )}
                  />
                  <span>
                    <span className="block">{t.projectTypeCkb}</span>
                    {t.projectTypeKmr ? (
                      <span className="text-muted-foreground block text-xs">
                        {t.projectTypeKmr}
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
                onClick={() => {
                  if (!draftCkb.trim()) return
                  const ckb = draftCkb.trim()
                  const kmr = draftKmr.trim()
                  onCreateInline?.({
                    projectTypeCkb: ckb,
                    projectTypeKmr: kmr,
                  })
                  addValue(ckb, kmr)
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
            {NS.field.type_helper}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
