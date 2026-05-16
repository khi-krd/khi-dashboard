"use client"

import { NS } from "@/components/news/news-strings"

export function LanguageChipBold({ lang }: { lang: "CKB" | "KMR" }) {
  const isSorani = lang === "CKB"
  return (
    <span
      className={
        isSorani
          ? "bg-primary/15 text-primary inline-flex h-7 max-w-23 min-w-12 items-center justify-center rounded-full px-2 text-[0.625rem] font-semibold leading-tight whitespace-nowrap"
          : "bg-muted text-muted-foreground border-border inline-flex h-7 max-w-23 min-w-12 items-center justify-center rounded-full border px-2 text-[0.625rem] font-semibold leading-tight whitespace-nowrap"
      }
    >
      {isSorani ? NS.lang.ckb : NS.lang.kmr}
    </span>
  )
}

export function NewsLanguageChipRow({ langs }: { langs: ("CKB" | "KMR")[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {langs.includes("CKB") ? <LanguageChipBold lang="CKB" /> : null}
      {langs.includes("KMR") ? <LanguageChipBold lang="KMR" /> : null}
    </div>
  )
}
