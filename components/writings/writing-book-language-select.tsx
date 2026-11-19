"use client"

import Link from "next/link"

import { MO } from "@/components/writings/options/managed-options-strings"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useManagedOptionsQuery } from "@/hooks/useWritingOptions"
import { bookGenreLabel } from "@/types/managed-option"

const NONE = "__none__"

/**
 * زمانی کتێب — the Kurdish-variety dropdown fed by the managed
 * book-languages vocabulary (the six seeded rows plus anything added later).
 * Stays a dropdown even as the vocabulary grows, per the spec.
 */
export function WritingBookLanguageSelect({
  value,
  onChange,
  label,
  placeholder,
  manageHref,
}: {
  value: number | null
  onChange: (id: number | null) => void
  label: string
  placeholder: string
  manageHref?: string
}) {
  const listQ = useManagedOptionsQuery("book-languages", false)
  const options = listQ.data ?? []
  const missing = value != null && !options.some((o) => o.id === value)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">{label}</span>
        {manageHref ? (
          <Link
            href={manageHref}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
          >
            {MO.action.manage}
          </Link>
        ) : null}
      </div>

      {listQ.isLoading ? (
        <Skeleton className="h-9 w-full rounded-md" />
      ) : (
        <Select
          value={value != null ? String(value) : NONE}
          onValueChange={(v) => onChange(v === NONE ? null : Number(v))}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent dir="rtl" className="max-h-64">
            <SelectItem value={NONE}>
              <span className="text-muted-foreground">{placeholder}</span>
            </SelectItem>
            {options.map((o) => (
              <SelectItem key={o.id} value={String(o.id)}>
                {bookGenreLabel(o)}
                {o.nameKmr && o.nameKmr !== o.nameCkb ? (
                  <span className="text-muted-foreground ms-2 text-xs" dir="ltr">
                    {o.nameKmr}
                  </span>
                ) : null}
              </SelectItem>
            ))}
            {missing ? (
              <SelectItem value={String(value)}>#{value}</SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
