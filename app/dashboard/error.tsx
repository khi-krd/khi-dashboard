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
    if (typeof window === "undefined") return
    // Report the real exception to the container log — the generic UI hides it
    // and the user's browser console is not reachable from the server.
    fetch("/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url: window.location.href,
      }),
    }).catch(() => {})
    // A page kept open across a redeploy holds dead chunk URLs — the lazy
    // bundles 404 and surface here (ChunkLoadError / "dynamically imported
    // module" / Safari's "module script failed"). Reload to pull the fresh
    // build, up to 3 tries per 60s so a still-stale first reload doesn't give
    // up permanently, then show the retry button instead of looping forever.
    const isChunkError =
      error.name === "ChunkLoadError" ||
      /loading chunk|dynamically imported module|module script failed|import\(\)/i.test(
        error.message,
      )
    const RELOAD_AT = "khi-chunk-reload-at"
    const RELOAD_TRIES = "khi-chunk-reload-tries"
    if (isChunkError) {
      const now = Date.now()
      const last = Number(sessionStorage.getItem(RELOAD_AT) ?? 0)
      const tries =
        now - last > 60_000
          ? 0
          : Number(sessionStorage.getItem(RELOAD_TRIES) ?? 0)
      if (tries < 3) {
        sessionStorage.setItem(RELOAD_AT, String(now))
        sessionStorage.setItem(RELOAD_TRIES, String(tries + 1))
        window.location.reload()
      }
      return
    }
    sessionStorage.removeItem(RELOAD_AT)
    sessionStorage.removeItem(RELOAD_TRIES)
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
