"use client"

import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"

export function AboutErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-muted-foreground">{NS.error.load}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {NS.error.retry}
      </Button>
    </div>
  )
}
