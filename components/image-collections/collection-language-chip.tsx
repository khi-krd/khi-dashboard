"use client"

import { NS } from "@/components/image-collections/collections-strings"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/image-collections"

export function CollectionListLangChips({
  languages,
}: {
  languages: Language[]
}) {
  const hasCkb = languages.includes("CKB")
  const hasKmr = languages.includes("KMR")
  if (!hasCkb && !hasKmr) return null
  return (
    <div className="flex flex-wrap gap-1">
      {hasCkb ? <CollectionLanguageChip lang="CKB" /> : null}
      {hasKmr ? <CollectionLanguageChip lang="KMR" /> : null}
    </div>
  )
}

export function CollectionLanguageChip({
  lang,
  active,
  onClick,
}: {
  lang: Language
  active?: boolean
  onClick?: () => void
}) {
  const label = lang === "CKB" ? NS.lang.ckb : NS.lang.kmr
  const Tag = onClick ? "button" : "span"
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-muted/50 text-muted-foreground",
        onClick && "hover:border-primary/40 cursor-pointer",
      )}
    >
      {label}
    </Tag>
  )
}

export function CollectionLanguageToggleChip({
  lang,
  active,
  onToggle,
  invalid,
}: {
  lang: Language
  active: boolean
  onToggle: () => void
  invalid?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/50",
        invalid && "border-destructive",
      )}
    >
      {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
      {invalid ? (
        <span className="bg-destructive absolute -top-0.5 -end-0.5 size-2 rounded-full" />
      ) : null}
    </button>
  )
}


export function CollectionLanguageChipRow({ langs }: { langs: Language[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {langs.map((l) => (
        <CollectionLanguageChip key={l} lang={l} />
      ))}
    </div>
  )
}
