"use client"

import { useEffect, useRef } from "react"
import type { FieldValues, UseFormReset } from "react-hook-form"

/**
 * Keeps a react-hook-form instance in step with the server record it edits.
 *
 * The section editors used to seed themselves exactly once, behind a
 * `bootstrapped` ref. That froze the card on its mount-time snapshot: a save
 * made in a sibling card, a value the backend rewrote on the way in (trimmed
 * text, dropped gallery slot, stripped markup) or a row deleted elsewhere all
 * stayed on screen as if nothing had happened, and the next save sent the
 * stale copy straight back.
 *
 * Re-seeding is driven by a `signature` that has to change whenever the
 * record does — `id:updatedAt` is the usual one. Two rules keep it safe:
 *
 * - The first seed always runs, so an editor mounted before its data arrives
 *   still fills in.
 * - Later seeds are skipped while the form is dirty. Unsaved typing is never
 *   thrown away by a background refetch; the card catches up on the next
 *   signature change after it is saved or reset.
 *
 * Pass `null` to defer seeding entirely (record still loading).
 */
export function useServerFormSync<TValues extends FieldValues>({
  signature,
  buildValues,
  reset,
  isDirty,
}: {
  signature: string | null
  buildValues: () => TValues
  reset: UseFormReset<TValues>
  isDirty: boolean
}): void {
  const seededSignature = useRef<string | null>(null)

  // Runs on every render by design — `buildValues` is a fresh closure each
  // time — and bails out on the signature check, which costs one string
  // comparison. Re-running is also what lets a card that was dirty when new
  // data arrived catch up the moment it stops being dirty.
  useEffect(() => {
    if (signature === null) return
    if (seededSignature.current === signature) return
    if (seededSignature.current !== null && isDirty) return

    seededSignature.current = signature
    reset(buildValues())
  }, [signature, isDirty, buildValues, reset])
}
