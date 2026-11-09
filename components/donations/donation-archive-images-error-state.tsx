"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { DAI } from "@/components/donations/donation-archive-images-strings"
import { Button } from "@/components/ui/button"

export function DonationArchiveImagesErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {message ?? DAI.error.generic}
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
        {DAI.error.retry}
      </Button>
    </div>
  )
}
