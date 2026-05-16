"use client"

import type { KeyboardEvent } from "react"
import * as React from "react"

import { NS } from "@/components/projects/projects-strings"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

function splitIncoming(raw: string) {
  return raw
    .split(/[,،\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ProjectTagInput({
  value,
  onChange,
  placeholder,
  chipClassName,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  chipClassName?: string
}) {
  const [draft, setDraft] = React.useState("")

  const commitDraft = React.useCallback(() => {
    const parts = [...value]
    splitIncoming(draft).forEach((p) => {
      if (!parts.includes(p)) parts.push(p)
    })
    setDraft("")
    if (parts.length !== value.length || draft.trim()) onChange(parts)
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
          <span
            key={tag}
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
              chipClassName,
            )}
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
          </span>
        ))}
      </div>
      <Input
        className="h-9 rounded-md border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        placeholder={placeholder ?? NS.field.tag_helper}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
