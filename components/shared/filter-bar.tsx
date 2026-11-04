"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Shared filter rail for every dashboard list page — one muted tray holding
 * a search cell, seamless select triggers and a reset action at the far end.
 * Active (non-default) selects tint themselves with the primary colour so the
 * current filter state is visible at a glance.
 */
export function FilterBar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-muted/30 flex flex-col gap-1.5 rounded-xl border p-1.5 shadow-sm",
        "md:flex-row md:flex-wrap md:items-center",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FilterSearch({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-background flex h-9 min-h-9 w-full min-w-0 items-center gap-2 rounded-lg border px-2.5",
        "transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
        "md:w-auto md:min-w-[13rem] md:flex-1",
        className,
      )}
    >
      <MagnifyingGlassIcon
        className="text-muted-foreground size-4 shrink-0"
        aria-hidden
      />
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-auto min-h-0 flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
      />
    </div>
  )
}

/**
 * Trigger class for <SelectTrigger> inside a FilterBar — borderless inside
 * the tray, tinted when the filter holds a non-default value.
 */
export function filterSelectTriggerClass(active?: boolean) {
  return cn(
    "h-9 min-h-9 w-full rounded-lg border-transparent bg-transparent px-2.5 text-sm font-normal shadow-none transition-colors",
    "hover:bg-muted/70 focus-visible:ring-1 focus-visible:ring-ring/30 data-[state=open]:bg-muted/70",
    active
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
      : "text-foreground/80",
  )
}

export function FilterSegmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: ReactNode; title?: string }[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-background inline-flex shrink-0 items-center gap-0.5 self-start rounded-lg border p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title ?? o.label}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function FilterReset({
  onClick,
  label,
  className,
}: {
  onClick: () => void
  label: string
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "text-muted-foreground hover:text-foreground h-9 shrink-0 gap-1.5 rounded-lg px-3 md:ms-auto",
        className,
      )}
    >
      <ArrowPathIcon className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
