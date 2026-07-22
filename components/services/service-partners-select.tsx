"use client"

import { useAboutPartnersQuery } from "@/hooks/useAbout"
import { NS } from "@/components/services/services-strings"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function ServicePartnersSelect({
  value,
  onChange,
}: {
  value: number[]
  onChange: (next: number[]) => void
}) {
  const partnersQ = useAboutPartnersQuery()
  const partners = (partnersQ.data ?? []).filter(
    (p) => typeof p.id === "number" && p.active !== false,
  )
  const selected = new Set(value)

  function toggle(id: number) {
    if (selected.has(id)) {
      onChange(value.filter((x) => x !== id))
    } else {
      onChange([...value, id])
    }
  }

  if (partnersQ.isLoading) {
    return <Spinner className="size-5" />
  }

  if (partners.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{NS.field.partnersEmpty}</p>
    )
  }

  return (
    <ul className="space-y-2">
      {partners.map((p) => {
        const id = p.id!
        const checked = selected.has(id)
        const name = p.nameCkb?.trim() || p.nameKmr?.trim() || `#${id}`
        return (
          <li key={id}>
            <label
              className={cn(
                "border-border flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                checked && "border-primary/40 bg-primary/5",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(id)}
              />
              {p.logoUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logoUrl}
                  alt=""
                  className="border-border size-8 shrink-0 rounded border object-contain"
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{name}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
