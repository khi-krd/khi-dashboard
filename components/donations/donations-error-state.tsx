"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/donations/donations-strings"
import { Button } from "@/components/ui/button"

export function DonationsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
      <p className="text-muted-foreground text-sm">{NS.error.generic}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <ArrowPathIcon className="me-1.5 size-4" />
        {NS.error.retry}
      </Button>
    </div>
  )
}
