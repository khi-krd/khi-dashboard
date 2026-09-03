"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { DTC } from "@/components/donations/donation-type-cards-strings"
import { Button } from "@/components/ui/button"

export function DonationTypeCardsErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <p className="text-muted-foreground max-w-md text-center text-sm">
        {message ?? DTC.error.generic}
      </p>
      <Button
        type="button"
        variant="outline"
        className="rounded-md"
        size="sm"
        onClick={onRetry}
      >
        <ArrowPathIcon
          data-icon="inline-start"
          className="size-4 rtl:rotate-180"
          aria-hidden
        />
        {DTC.error.retry}
      </Button>
    </div>
  )
}
