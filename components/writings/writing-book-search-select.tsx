"use client"

import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useQuery } from "@tanstack/react-query"
import { writingsKeys } from "@/lib/writings-query-keys"
import { searchWritingsByTitle } from "@/services/writingsService"
import { cn } from "@/lib/utils"
import type { WritingDto } from "@/types/writings"

function bookTitle(w: WritingDto | undefined, fallback = "—"): string {
  return (
    w?.ckbContent?.title?.trim() ||
    w?.kmrContent?.title?.trim() ||
    fallback
  )
}

/**
 * Searchable book picker — type a title, get live matches from
 * `/search/title`, pick one as the selected id. Used for the original-book
 * (چاپی یەکەم) link; each result shows the writer so same-titled books stay
 * distinguishable.
 */
export function WritingBookSearchSelect({
  value,
  selectedTitle,
  excludeId,
  onChange,
  placeholder,
  clearLabel,
  emptyLabel,
}: {
  value: number | null
  /** Title of the already-selected book (from the loaded dto). */
  selectedTitle?: string | null
  excludeId?: number
  onChange: (id: number | null, title: string | null) => void
  placeholder: string
  clearLabel: string
  emptyLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const q = useDebouncedValue(typed, 300)

  const searchQ = useQuery({
    queryKey: writingsKeys.search("title", q.trim()),
    queryFn: () => searchWritingsByTitle(q.trim(), 0, 20),
    enabled: open && q.trim().length > 0,
    staleTime: 1000 * 30,
  })

  const results = useMemo(
    () =>
      (searchQ.data?.content ?? []).filter(
        (w) => w.id != null && w.id !== excludeId,
      ),
    [searchQ.data, excludeId],
  )

  const displayTitle =
    value != null ? (selectedTitle?.trim() || `#${value}`) : null

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex gap-1.5">
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-start font-normal"
              >
                {displayTitle ? (
                  <span className="truncate">{displayTitle}</span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
              </Button>
            }
          />
          {value != null ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto min-h-9 shrink-0"
              onClick={() => onChange(null, null)}
              aria-label={clearLabel}
            >
              <XMarkIcon className="size-4" />
            </Button>
          ) : null}
        </div>
        <PopoverContent dir="rtl" className="w-[var(--anchor-width)] p-2">
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute end-2.5 top-2.5 size-4" />
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={placeholder}
              className="h-9 pe-8"
              autoFocus
            />
          </div>
          <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
            {q.trim() && searchQ.isLoading ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">…</p>
            ) : null}
            {q.trim() && !searchQ.isLoading && results.length === 0 ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">
                {emptyLabel}
              </p>
            ) : null}
            {results.map((w) => {
              const writer = w.persons?.[0]?.nameCkb?.trim()
              const checked = value === w.id
              const title = bookTitle(w, `#${w.id}`)
              return (
                <button
                  key={w.id}
                  type="button"
                  className={cn(
                    "hover:bg-muted flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                    checked && "bg-muted",
                  )}
                  onClick={() => {
                    onChange(w.id ?? null, title)
                    setOpen(false)
                    setTyped("")
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{title}</span>
                    {writer ? (
                      <span className="text-muted-foreground block truncate text-xs">
                        {writer}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    #{w.id}
                  </span>
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
