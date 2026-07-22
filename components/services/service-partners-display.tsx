"use client"

import { useAboutPartnersQuery } from "@/hooks/useAbout"
import { NS } from "@/components/services/services-strings"
import { Spinner } from "@/components/ui/spinner"

export function ServicePartnersDisplay({ partnerIds }: { partnerIds: number[] }) {
  const partnersQ = useAboutPartnersQuery()
  const ids = new Set(partnerIds)

  if (partnerIds.length === 0) return null

  if (partnersQ.isLoading) {
    return <Spinner className="size-5" />
  }

  const matched = (partnersQ.data ?? []).filter(
    (p) => typeof p.id === "number" && ids.has(p.id),
  )

  if (matched.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{NS.field.partnersEmpty}</p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {matched.map((p) => {
        const name = p.nameCkb?.trim() || p.nameKmr?.trim() || `#${p.id}`
        return (
          <li
            key={p.id}
            className="border-border flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
          >
            {p.logoUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.logoUrl}
                alt=""
                className="border-border size-8 shrink-0 rounded border object-contain"
              />
            ) : null}
            <span className="min-w-0 flex-1 truncate">{name}</span>
          </li>
        )
      })}
    </ul>
  )
}
