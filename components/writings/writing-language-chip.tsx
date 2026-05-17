"use client"

import { NS } from "@/components/writings/writings-strings"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/writings"

export function WritingListLangChips({ langs }: { langs: Language[] }) {
  const set = new Set(langs ?? [])
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {set.has("CKB") ? (
        <span
          className={cn(
            "text-primary border-primary/20 bg-primary/10 inline-flex rounded border",
            "px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
          )}
        >
          CKB
        </span>
      ) : null}
      {set.has("KMR") ? (
        <span
          className={cn(
            "text-foreground border-border bg-muted inline-flex rounded border",
            "px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
          )}
        >
          KMR
        </span>
      ) : null}
    </div>
  )
}

export function WritingLanguageChipRow({ langs }: { langs: Language[] }) {
  return <WritingListLangChips langs={langs} />
}

export function WritingLanguageToggleChip({
  lang,
  active,
  onClick,
  hasError,
}: {
  lang: Language
  active: boolean
  onClick: () => void
  hasError?: boolean
}) {
  const label = lang === "CKB" ? NS.lang.ckb : NS.lang.kmr
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? lang === "CKB"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted/50",
      )}
    >
      {label}
      {hasError ? (
        <span
          className="bg-destructive absolute -top-0.5 -end-0.5 size-2 rounded-full"
          aria-hidden
        />
      ) : null}
    </button>
  )
}
