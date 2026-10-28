"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

export type FormDraftStatus = "idle" | "saving" | "saved" | "error"

export const FORM_DRAFT_PREFIX = "khi-draft:"
const DEBOUNCE_MS = 1500

export interface StoredFormDraft {
  values: Record<string, unknown>
  savedAt: string
  /**
   * The record's `updatedAt` at the moment the draft was written. Restoring
   * only trusts drafts whose baseline matches the current record — immune to
   * client/server clock skew, unlike comparing savedAt to updatedAt.
   */
  baseUpdatedAt?: string | null
}

export function formDraftKey(
  entity: string,
  recordId?: number | string | null,
  userKey?: string | null,
): string {
  return `${FORM_DRAFT_PREFIX}${entity}:${recordId ?? "new"}:${userKey ?? "anon"}`
}

// Staged upload fields hold File objects that localStorage cannot keep — the
// key is dropped so the serializable URL fields beside them still restore.
const SKIP_KEY = /staged|File$/i

function isFileLike(value: unknown): boolean {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Deep-copies form values into a JSON-safe shape. `File`/`Blob` instances,
 * `staged*`/`…File` keys, functions and non-plain class instances are dropped;
 * everything else (strings, numbers, arrays, plain objects) survives intact.
 */
export function sanitizeDraftValues(value: unknown, key?: string): unknown {
  if (value == null) return value
  if (typeof value === "function") return undefined
  if (isFileLike(value)) return undefined
  if (key != null && SKIP_KEY.test(key)) return undefined
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) {
    return value.map((item) => {
      const cleaned = sanitizeDraftValues(item)
      return cleaned === undefined ? null : cleaned
    })
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const cleaned = sanitizeDraftValues(v, k)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return out
  }
  if (typeof value === "object") return undefined
  return value
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value).sort()) out[k] = sortKeysDeep(value[k])
    return out
  }
  return value
}

function stableSerialize(value: unknown): string {
  try {
    return JSON.stringify(sortKeysDeep(value)) ?? ""
  } catch {
    return ""
  }
}

/** Draft wins on conflicts; plain objects merge recursively, arrays/primitives replace. */
function mergeDraftValues(base: unknown, draft: unknown): unknown {
  if (isPlainObject(base) && isPlainObject(draft)) {
    const out: Record<string, unknown> = { ...base }
    for (const [k, v] of Object.entries(draft)) {
      out[k] = k in out ? mergeDraftValues(out[k], v) : v
    }
    return out
  }
  return draft
}

export function readStoredDraft(key: string): StoredFormDraft | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredFormDraft
    if (
      !isPlainObject(parsed) ||
      !isPlainObject(parsed.values) ||
      typeof parsed.savedAt !== "string"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function removeStoredDraft(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // localStorage may be unavailable (private mode) — drafts are best-effort.
  }
}

/**
 * A persistent draft layer over a react-hook-form instance. Unsaved work is
 * mirrored to `localStorage` (debounced ~1.5s after the last change) so a
 * failed submit, upload error, refresh or accidental navigation never destroys
 * entered content.
 *
 * Restore precedence: on mount (or once `enabled` turns on — i.e. the server
 * record finished seeding the form) a stored draft is applied when it exists
 * AND it is newer than the record's `recordUpdatedAt` — or the form is a
 * `new` record, where any draft qualifies. A draft never restores over a form
 * the user already touched (`isDirty`), and a write never persists values that
 * sanitize back to the form's own defaults, so an emptied-out form cannot
 * clobber a real earlier draft.
 *
 * Wire it AFTER the record-seeding `useEffect`/`useServerFormSync` so its
 * restore runs after the server snapshot lands, and call `clear()` on the
 * submit success path. Every storage access is try/catch'd — a quota or
 * serialization failure must never break the form itself.
 */
export function useFormDraft<TValues extends FieldValues>({
  entity,
  recordId,
  form,
  userKey,
  enabled = true,
  recordUpdatedAt,
}: {
  entity: string
  recordId?: number | string | null
  form: UseFormReturn<TValues>
  userKey?: string | null
  enabled?: boolean
  /** ISO timestamp of the server record's last update; older drafts are stale. */
  recordUpdatedAt?: string | null
}): {
  status: FormDraftStatus
  restored: boolean
  draftSavedAt: string | null
  clear: () => void
} {
  const [status, setStatus] = useState<FormDraftStatus>("idle")
  const [restored, setRestored] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  const storageKey = formDraftKey(entity, recordId, userKey)
  // Each key gets exactly one restore attempt — the userKey slot is filled in
  // asynchronously after a refresh, so a later key change still gets its shot.
  const attemptedKeysRef = useRef(new Set<string>())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const writeDraft = useCallback(() => {
    try {
      const values = sanitizeDraftValues(form.getValues())
      const defaults = sanitizeDraftValues(form.formState.defaultValues ?? {})
      if (stableSerialize(values) === stableSerialize(defaults)) {
        // Nothing worth keeping — and crucially, an all-empty form must never
        // overwrite a real draft that is already stored under this key.
        setStatus(readStoredDraft(storageKey) ? "saved" : "idle")
        return
      }
      const payload: StoredFormDraft = {
        values: isPlainObject(values) ? values : {},
        savedAt: new Date().toISOString(),
        baseUpdatedAt: recordId != null ? (recordUpdatedAt ?? null) : null,
      }
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
      setDraftSavedAt(payload.savedAt)
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }, [form, storageKey, recordId, recordUpdatedAt])

  const scheduleWrite = useCallback(() => {
    setStatus("saving")
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      writeDraft()
    }, DEBOUNCE_MS)
  }, [writeDraft])

  // Restore once per storage key, after the form's own seeding has run.
  useEffect(() => {
    if (!enabled) return
    if (attemptedKeysRef.current.has(storageKey)) return
    attemptedKeysRef.current.add(storageKey)

    // The user slot fills in asynchronously after a refresh — a draft saved
    // while the store was still hydrating lives under the `anon` key, so fall
    // back to it when the resolved key holds nothing.
    const draft =
      readStoredDraft(storageKey) ??
      readStoredDraft(formDraftKey(entity, recordId, null))
    if (!draft) return
    // Stale guard: for an existing record the draft is trusted when it was
    // written against the same record version (string equality — no clock
    // comparison, so client/server skew can never discard a real draft).
    // Drafts without a baseline (written before this field existed) restore
    // leniently, and new records accept any draft.
    if (
      recordId != null &&
      recordUpdatedAt != null &&
      draft.baseUpdatedAt != null &&
      draft.baseUpdatedAt !== recordUpdatedAt
    ) {
      return
    }
    // Never restore over typing that is already in progress. Compare the
    // actual values rather than `isDirty` — schema defaults can leave a
    // fresh form technically dirty and must not block a restore.
    const current = stableSerialize(sanitizeDraftValues(form.getValues()))
    const defaults = stableSerialize(
      sanitizeDraftValues(form.formState.defaultValues ?? {}),
    )
    if (current !== defaults) return

    const merged = mergeDraftValues(form.getValues(), draft.values) as TValues
    // keepDefaultValues: the server snapshot stays the dirty baseline, so the
    // restored draft reads as unsaved work and the save button stays armed.
    form.reset(merged, { keepDefaultValues: true })
    // React state updates are queued off the effect body — the codebase's
    // eslint flat config errors on synchronous setState inside effects.
    queueMicrotask(() => {
      setRestored(true)
      setDraftSavedAt(draft.savedAt)
      setStatus("saved")
    })
  }, [enabled, entity, storageKey, recordId, recordUpdatedAt, form])

  // Debounced autosave driven by the watch subscription; a pending write is
  // flushed synchronously on unmount (SPA navigation) and beforeunload
  // (refresh / tab close) so a last keystroke is never lost.
  useEffect(() => {
    if (!enabled) return
    const subscription = form.watch(() => scheduleWrite())
    const flush = () => {
      if (timerRef.current === null) return
      clearTimeout(timerRef.current)
      timerRef.current = null
      writeDraft()
    }
    window.addEventListener("beforeunload", flush)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener("beforeunload", flush)
      flush()
    }
  }, [enabled, form, scheduleWrite, writeDraft])

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    removeStoredDraft(storageKey)
    setStatus("idle")
    setRestored(false)
    setDraftSavedAt(null)
  }, [storageKey])

  return { status, restored, draftSavedAt, clear }
}
