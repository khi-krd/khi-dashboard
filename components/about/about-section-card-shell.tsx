"use client"

import { CheckIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatCkbDigits } from "@/lib/intl-ckb"

export function AboutSectionCardShell({
  index,
  titlePreview,
  onSave,
  saveDisabled,
  pending,
  children,
  hideSave,
}: {
  index: number
  titlePreview?: string
  onSave?: () => void
  saveDisabled?: boolean
  pending?: boolean
  children: React.ReactNode
  hideSave?: boolean
}) {
  return (
    <section className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {NS.page.sectionLabel(formatCkbDigits(index + 1))}
          </p>
          {titlePreview ? (
            <p className="truncate text-sm font-medium">{titlePreview}</p>
          ) : null}
        </div>
        {!hideSave && onSave ? (
          <Button
            type="button"
            size="sm"
            disabled={saveDisabled}
            className="gap-1"
            onClick={onSave}
          >
            {pending ? (
              <Spinner className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {pending ? NS.action.saving : NS.action.save}
          </Button>
        ) : null}
      </div>
      <div className="space-y-5 border-t px-4 py-4">{children}</div>
    </section>
  )
}
