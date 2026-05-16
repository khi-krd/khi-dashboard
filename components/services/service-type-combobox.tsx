"use client"

import { useState } from "react"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function ServiceTypeCombobox({
  items,
  value,
  onChange,
  error,
}: {
  items: string[]
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-9 w-full justify-between rounded-md px-3 text-start font-normal",
                error && "border-destructive",
              )}
            >
              {value.trim() ? (
                <span className="truncate">{value}</span>
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
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {items.map((t) => (
              <button
                key={t}
                type="button"
                className={cn(
                  "hover:bg-muted w-full rounded-md px-2 py-1.5 text-start text-sm",
                  value === t && "bg-muted",
                )}
                onClick={() => {
                  onChange(t)
                  setDraft(t)
                  setOpen(false)
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="border-border mt-2 space-y-2 border-t pt-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={NS.field.typeHelper}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  onChange(draft.trim())
                  setOpen(false)
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => {
                if (!draft.trim()) return
                onChange(draft.trim())
                setOpen(false)
              }}
            >
              {NS.collection.addButton}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">{NS.field.typeHelper}</p>
        </PopoverContent>
      </Popover>
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : null}
    </div>
  )
}
