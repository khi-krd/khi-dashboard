"use client"

import type { KeyboardEvent } from "react"
import * as React from "react"

import { NS } from "@/components/news/news-strings"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/reui/badge"

function splitIncoming(raw: string) {
  return raw
    .split(/[,،\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function NewsTagInput({
  value,
  onChange,
  placeholder,
  badgeVariant,
  badgeClassName,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  badgeVariant?: React.ComponentProps<typeof Badge>["variant"]
  badgeClassName?: string
}) {
  const [draft, setDraft] = React.useState("")

  const commitDraft = React.useCallback(() => {
    const parts = [...value]
    splitIncoming(draft).forEach((p) => {
      if (!parts.includes(p)) parts.push(p)
    })
    setDraft("")
    if (parts.length !== value.length || draft.trim()) {
      onChange(parts)
    }
  }, [draft, onChange, value])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitDraft()
    }
    if (e.key === "Backspace" && !draft.trim() && value.length) {
      e.preventDefault()
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="border-input bg-background rounded-md border p-2">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant={badgeVariant ?? "secondary"}
            className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", badgeClassName)}
          >
            {tag}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground ms-2"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`${NS.action.delete} ${tag}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        aria-label={NS.field.keywords}
        className="h-9 rounded-md border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
