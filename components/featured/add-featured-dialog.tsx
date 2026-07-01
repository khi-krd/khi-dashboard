"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"

export type AddFeaturedCandidate = {
  id: number
  title: string
  subtitle?: string | null
  coverUrl?: string | null
  fallbackIcon: React.ReactNode
}

export function AddFeaturedDialog({
  open,
  onOpenChange,
  title,
  candidates,
  isLoading,
  isPending,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  candidates: AddFeaturedCandidate[]
  isLoading?: boolean
  isPending?: boolean
  onSelect: (id: number) => void
}) {
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search.trim(), 250)

  const filtered = useMemo(() => {
    if (!debounced) return candidates
    const q = debounced.toLowerCase()
    return candidates.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q),
    )
  }, [candidates, debounced])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-border border-b px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>

        <div className="border-border border-b px-5 py-3">
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground absolute inset-e-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={NS.dialog.search_placeholder}
              className="pe-10"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[min(50vh,24rem)] overflow-y-auto px-3 py-2">
          {isLoading ? (
            <div className="space-y-2 px-2 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-muted-foreground px-2 py-8 text-center text-sm">
              {NS.dialog.all_featured}
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-8 text-center text-sm">
              {NS.dialog.no_results}
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((item) => {
                const cover = item.coverUrl?.trim()
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => onSelect(item.id)}
                      className={cn(
                        "hover:bg-muted/70 flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-start transition-colors",
                        isPending && "opacity-60",
                      )}
                    >
                      <div className="bg-muted relative size-11 shrink-0 overflow-hidden rounded-md">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={cover.startsWith("http")}
                          />
                        ) : (
                          <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center">
                            {item.fallbackIcon}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {item.title || "—"}
                        </p>
                        {item.subtitle ? (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-border border-t px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {NS.dialog.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
