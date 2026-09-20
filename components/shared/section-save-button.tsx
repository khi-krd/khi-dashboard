"use client"

import { CheckIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/**
 * Per-section save for sectioned settings forms. These pages keep one
 * react-hook-form across several cards, and the backend PUT is a full
 * replace — so a section button is just a second `type="submit"` for the
 * same form; it saves the editor a scroll to the bottom after touching one
 * card. Same convention as the contact card shell: check icon at rest,
 * spinner while pending.
 */
export function SectionSaveButton({
  disabled,
  pending,
  label,
  pendingLabel,
}: {
  disabled: boolean
  pending?: boolean
  label: string
  /** Falls back to `label` when the strings file has no "saving…" variant. */
  pendingLabel?: string
}) {
  return (
    <Button
      type="submit"
      size="sm"
      disabled={disabled}
      className="shrink-0 gap-1"
    >
      {pending ? (
        <Spinner className="size-3.5" aria-hidden />
      ) : (
        <CheckIcon className="size-3.5" aria-hidden />
      )}
      {pending ? (pendingLabel ?? label) : label}
    </Button>
  )
}
