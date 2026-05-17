"use client"

import { useMemo, useState } from "react"

import { NS } from "@/components/sounds/sounds-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function SoundTypeCombobox({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [focused, setFocused] = useState(false)
  const suggestions = NS.sound_type_suggestions
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return [...suggestions]
    return suggestions.filter((s) => s.toLowerCase().includes(q))
  }, [value, suggestions])

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs uppercase">{NS.section.type}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={NS.field.sound_type_helper}
          className={cn("h-9", error && "border-destructive")}
          list="sound-type-suggestions"
          maxLength={100}
        />
        <datalist id="sound-type-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {focused && filtered.length > 0 ? (
          <ul className="border-border bg-popover absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-md border shadow-md">
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="hover:bg-muted w-full px-3 py-2 text-start text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(s)
                    setFocused(false)
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">{NS.field.sound_type_helper}</p>
      <FieldError>{error}</FieldError>
    </div>
  )
}
