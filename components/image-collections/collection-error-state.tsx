"use client"

import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"

export function CollectionErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-muted-foreground text-sm">
        {message ?? NS.error.generic}
      </p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {NS.error.retry}
        </Button>
      ) : null}
    </div>
  )
}
