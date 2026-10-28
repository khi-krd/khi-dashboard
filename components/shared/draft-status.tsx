"use client"

import { ExclamationCircleIcon } from "@heroicons/react/24/outline"

import { DRAFT_NS } from "@/components/shared/draft-strings"
import { Spinner } from "@/components/ui/spinner"
import type { FormDraftStatus } from "@/hooks/use-form-draft"
import { cn } from "@/lib/utils"

/**
 * Inline chip reporting the localStorage draft state. A restored draft keeps
 * its "گەڕێندرایەوە" note until the next keystroke flips the status back to
 * the regular saving/saved cycle; nothing renders while idle.
 */
export function DraftStatus({
  status,
  restored,
  className,
}: {
  status: FormDraftStatus
  restored: boolean
  className?: string
}) {
  if (status === "error") {
    return (
      <span
        className={cn(
          "text-destructive inline-flex items-center gap-1 text-xs",
          className,
        )}
      >
        <ExclamationCircleIcon className="size-3.5 shrink-0" aria-hidden />
        {DRAFT_NS.status.error}
      </span>
    )
  }

  if (status === "saving") {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1.5 text-xs",
          className,
        )}
      >
        <Spinner className="size-3" aria-hidden />
        {DRAFT_NS.status.saving}
      </span>
    )
  }

  if (restored) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400",
          className,
        )}
      >
        <span className="inline-flex size-1.5 rounded-full bg-amber-500" aria-hidden />
        {DRAFT_NS.status.restored}
      </span>
    )
  }

  if (status === "saved") {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1.5 text-xs",
          className,
        )}
      >
        <span
          className="bg-primary inline-flex size-1.5 rounded-full"
          aria-hidden
        />
        {DRAFT_NS.status.saved}
      </span>
    )
  }

  return null
}
