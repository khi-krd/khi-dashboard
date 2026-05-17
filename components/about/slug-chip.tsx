"use client"

import {
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { NS } from "@/components/about/about-strings"
import { copyAboutPublicUrl } from "@/lib/about-url-helpers"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

export function SlugChip({
  lang,
  value,
}: {
  lang: "ckb" | "kmr"
  value: string | null | undefined
}) {
  const { copyToClipboard } = useCopyToClipboard()

  if (!value?.trim()) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
        <ExclamationTriangleIcon className="size-3" aria-hidden />
        {NS.slug.missing}
      </span>
    )
  }

  const tint =
    lang === "ckb"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        copyToClipboard(copyAboutPublicUrl(value.trim()))
        toast(NS.toast.copied)
      }}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors hover:bg-opacity-20",
        tint,
      )}
      title={NS.slug.copy_title}
    >
      <span className="text-[9px] uppercase tracking-wide opacity-60">
        {lang}
      </span>
      <span>{value}</span>
      <ClipboardDocumentIcon
        className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </button>
  )
}
