"use client"

import { NS } from "@/components/about/about-strings"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/about"

export function AboutLanguageChip({
  lang,
  compact,
}: {
  lang: Language
  compact?: boolean
}) {
  const label = lang === "CKB" ? NS.lang.ckb : NS.lang.kmr
  const tint =
    lang === "CKB"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        tint,
      )}
    >
      {compact ? (lang === "CKB" ? "ک" : "کم") : label}
    </span>
  )
}

export function AboutLanguageChipRow({ langs }: { langs: Language[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {langs.map((l) => (
        <AboutLanguageChip key={l} lang={l} compact />
      ))}
    </div>
  )
}
