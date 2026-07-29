"use client"

import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

/**
 * Contains a render error to the dashboard content area — the sidebar,
 * breadcrumbs and sound player in `app/dashboard/layout.tsx` stay mounted.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      dir="rtl"
      className="flex flex-1 flex-col items-center justify-center gap-3 py-20"
    >
      <ExclamationTriangleIcon
        className="text-muted-foreground size-10"
        aria-hidden
      />
      <h2 className="text-lg font-medium">هەڵەیەک ڕوویدا</h2>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        نەتوانرا ئەم بەشە پیشان بدرێت. تکایە دووبارە هەوڵبدەرەوە.
      </p>
      {error.digest ? (
        <p className="text-muted-foreground/70 font-mono text-xs" dir="ltr">
          {error.digest}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="rounded-md"
        size="sm"
        onClick={reset}
      >
        <ArrowPathIcon
          data-icon="inline-start"
          className="size-4 rtl:rotate-180"
          aria-hidden
        />
        دووبارە هەوڵبدەرەوە
      </Button>
    </div>
  )
}
