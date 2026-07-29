"use client"

import { useEffect, useMemo } from "react"

/**
 * Blob URL for a locally-picked file, revoked when the file changes or the
 * component unmounts.
 *
 * The URL is derived during render rather than assigned from inside an effect.
 * The older shape — `useEffect(() => setUrl(createObjectURL(file)))` — renders
 * once with a null preview before the effect fires, which both flashes an empty
 * slot and trips `react-hooks/set-state-in-effect`. Here the effect only
 * registers the cleanup, so there is no extra render.
 */
export function useObjectUrl(file: File | null | undefined): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])

  return url
}
