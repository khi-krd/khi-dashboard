"use client"

import { NS } from "@/components/projects/projects-strings"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/projects"

export function ProjectListLangChips({ langs }: { langs: Language[] }) {
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
          {NS.lang.ckbShort}
        </span>
      ) : null}
      {set.has("KMR") ? (
        <span
          className={cn(
            "text-foreground border-border bg-muted inline-flex rounded border",
            "px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
          )}
        >
          {NS.lang.kmrShort}
        </span>
      ) : null}
    </div>
  )
}

export function ProjectLanguageChipRow({ langs }: { langs: Language[] }) {
  return <ProjectListLangChips langs={langs} />
}
