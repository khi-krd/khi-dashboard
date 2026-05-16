"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/news/news-strings"
import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CategoryDto } from "@/types/news"

export function NewsCategoryCombobox({
  items,
  value,
  onChange,
  placeholder,
  labelId,
  onCreateInline,
  allowCreate,
  variant,
  disabled,
}: {
  items: CategoryDto[]
  value: CategoryDto | null
  onChange: (c: CategoryDto | null) => void
  placeholder?: string
  labelId?: string
  allowCreate?: boolean
  variant?: "category" | "subcategory"
  onCreateInline?: (c: CategoryDto) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [ckbNew, setCkbNew] = React.useState("")
  const [kmrNew, setKmrNew] = React.useState("")

  const normalized = query.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    if (!normalized) return items
    return items.filter(
      (c) =>
        c.ckbName.toLowerCase().includes(normalized) ||
        c.kmrName.toLowerCase().includes(normalized),
    )
  }, [items, normalized])

  const displayed = value?.ckbName?.trim() || value?.kmrName?.trim() || ""
  const variantKey = variant ?? "category"

  function applyCreate() {
    if (!onCreateInline) return
    const ckb = ckbNew.trim()
    const kmr = kmrNew.trim()
    if (!ckb || !kmr) return
    const next: CategoryDto = { ckbName: ckb, kmrName: kmr }
    onCreateInline(next)
    onChange(next)
    setCreateOpen(false)
    setCkbNew("")
    setKmrNew("")
    setOpen(false)
    setQuery("")
  }

  const ph =
    placeholder ??
    (variantKey === "category" ? NS.field.category : NS.field.subcategory)

  return (
    <div className="flex flex-col gap-2">
      <Popover
        open={disabled ? false : open}
        onOpenChange={(v) => {
          if (!disabled) setOpen(v)
        }}
      >
        <PopoverTrigger
          aria-labelledby={labelId}
          nativeButton={false}
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "border-input hover:bg-muted/80 text-foreground h-9 w-full justify-between rounded-md px-2 font-normal",
              )}
            >
              <span className="truncate text-start text-sm">
                {displayed || ph}
              </span>
              <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" />
            </Button>
          }
        />

        <PopoverContent dir="rtl" align="start" sideOffset={6} className="w-96 p-3">
          <div className="flex flex-col gap-2">
            <Input
              className="h-9 rounded-md"
              placeholder={NS.filter.search_placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={NS.filter.search_placeholder}
            />
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {filtered.length ? (
                filtered.map((item) => (
                  <button
                    key={`${variantKey}-${item.ckbName}-${item.kmrName}`}
                    type="button"
                    className="hover:bg-muted/60 w-full rounded-md px-3 py-2 text-start text-sm"
                    onClick={() => {
                      onChange(item)
                      setOpen(false)
                      setQuery("")
                    }}
                  >
                    <div className="text-foreground font-medium">
                      {item.ckbName}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {item.kmrName || NS.dash}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground px-3 py-2 text-sm">
                  {NS.empty.no_results.title}
                </p>
              )}
            </div>
            {allowCreate && onCreateInline ? (
              <Collapsible open={createOpen} onOpenChange={setCreateOpen}>
                <CollapsibleTrigger
                  nativeButton={false}
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-md"
                    >
                      <PlusIcon data-icon="inline-start" className="size-4" />
                      {variantKey === "category"
                        ? NS.action.add_category
                        : NS.action.add_subcategory}
                    </Button>
                  }
                />
                <CollapsibleContent className="flex flex-col gap-2 pb-2">
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {NS.lang.ckb}
                      </Label>
                      <Input
                        value={ckbNew}
                        onChange={(e) => setCkbNew(e.target.value)}
                        className="h-9 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {NS.lang.kmr}
                      </Label>
                      <Input
                        value={kmrNew}
                        onChange={(e) => setKmrNew(e.target.value)}
                        className="h-9 rounded-md"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-md"
                    onClick={applyCreate}
                  >
                    {NS.action.add_inline}
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>

      {value ? (
        <Badge
          variant="invert-light"
          size="sm"
          className="border-border text-foreground rounded-md px-2 py-1 text-xs font-normal"
        >
          {value.ckbName} · {value.kmrName}
        </Badge>
      ) : null}
    </div>
  )
}
