"use client"

import { useCallback, useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep tabs in agreement when the preference changes elsewhere.
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

/**
 * A view-mode preference backed by localStorage.
 *
 * `useSyncExternalStore` is the right primitive here because the value lives
 * outside React and is unavailable during SSR. It renders `serverDefault` on
 * the server, then swaps to the stored value after hydration — no mismatch
 * warning, and no `useEffect(() => setState(read()))`, which rendered once with
 * the wrong mode and tripped `react-hooks/set-state-in-effect`.
 *
 * `read` must return a primitive; returning a fresh object each call would spin.
 */
export function useStoredViewMode<T extends string>(
  read: () => T,
  write: (value: T) => void,
  serverDefault: T,
): [T, (value: T) => void] {
  const mode = useSyncExternalStore(subscribe, read, () => serverDefault)

  const setMode = useCallback(
    (value: T) => {
      write(value)
      emit()
    },
    [write],
  )

  return [mode, setMode]
}
