"use client"

/**
 * IndexedDB sidecar for form drafts: localStorage holds the JSON-safe values
 * (see `sanitizeDraftValues`), while this store keeps the `File`/`Blob`
 * objects that JSON cannot carry. Entries are keyed by the same draft key and
 * deleted when the draft is cleared.
 */

const DB_NAME = "khi-form-drafts"
const STORE = "files"
const DB_VERSION = 1

export interface DraftFileEntry {
  /** Dot path inside the form values, e.g. "videoClipItems.0.stagedVideoFile". */
  path: string
  file: File
}

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

/** Collect every File/Blob in a form-values tree into dot-path entries. */
export function collectDraftFiles(
  value: unknown,
  path = "",
  out: DraftFileEntry[] = [],
): DraftFileEntry[] {
  if (value == null) return out
  if (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  ) {
    if (value instanceof File && path) out.push({ path, file: value })
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectDraftFiles(item, `${path}.${i}`, out))
    return out
  }
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value)
    if (proto === Object.prototype || proto === null) {
      for (const [k, v] of Object.entries(value)) {
        collectDraftFiles(v, path ? `${path}.${k}` : k, out)
      }
    }
  }
  return out
}

/** Cheap identity for a file set — skips rewriting unchanged blobs to IDB. */
export function draftFilesFingerprint(entries: DraftFileEntry[]): string {
  return entries
    .map((e) => `${e.path}:${e.file.name}:${e.file.size}:${e.file.lastModified}`)
    .sort()
    .join("|")
}

export async function saveDraftFiles(
  key: string,
  entries: DraftFileEntry[],
): Promise<void> {
  const db = await openDb()
  if (!db) return
  try {
    const tx = db.transaction(STORE, "readwrite")
    if (entries.length) {
      tx.objectStore(STORE).put(entries, key)
    } else {
      tx.objectStore(STORE).delete(key)
    }
  } catch {
    // Quota or serialization failure — drafts stay best-effort.
  }
}

export async function loadDraftFiles(
  key: string,
): Promise<DraftFileEntry[]> {
  const db = await openDb()
  if (!db) return []
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key)
      req.onsuccess = () =>
        resolve(Array.isArray(req.result) ? (req.result as DraftFileEntry[]) : [])
      req.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

export async function deleteDraftFiles(key: string): Promise<void> {
  const db = await openDb()
  if (!db) return
  try {
    db.transaction(STORE, "readwrite").objectStore(STORE).delete(key)
  } catch {
    // best-effort
  }
}
