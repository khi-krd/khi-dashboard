"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  compressImage,
  isCompressibleImage,
  probeImageSize,
  type CompressedImageResult,
  type CompressImageOptions,
} from "@/lib/image-compression"

/** Max files compressed at once — the rest wait as `idle`. */
const MAX_CONCURRENT = 3

export type StagedCompressionStatus =
  | "idle"
  | "compressing"
  | "done"
  | "unchanged"
  | "error"

export type StagedUploadStatus = "idle" | "uploading" | "done" | "error"

export type StagedImageItem = {
  id: string
  /** Original picked file — never mutated. */
  file: File
  name: string
  /** True when the file is never sent through the compressor (video, GIF,
   * SVG, non-image — or the toggle is off): it uploads its original bytes. */
  passthrough: boolean
  /** Object URL for the ORIGINAL thumb (revoked on remove/clear/unmount). */
  previewUrl: string
  /** Object URL for the compressed output preview, when it differs. */
  outputUrl: string | null
  width: number | null
  height: number | null
  status: StagedCompressionStatus
  result: CompressedImageResult | null
  error: string | null
  compressProgress: number | null
  uploadStatus: StagedUploadStatus
  uploadProgress: number | null
}

export type CompressionBatchStats = {
  total: number
  pending: number
  compressed: number
  unchanged: number
  failed: number
  originalBytes: number
  outputBytes: number
  savedBytes: number
  /** (Σorig − Σout) / Σorig — byte-weighted, never an average of percents. */
  savedPct: number
}

let nextId = 0
function stageId(): string {
  nextId += 1
  return `cmp-${nextId}`
}

function optionsKey(o: CompressImageOptions): string {
  return JSON.stringify([
    o.quality ?? null,
    o.maxSizeKB ?? null,
    o.convertToWebP ?? false,
    o.keepDimensions ?? true,
    o.maxWidthOrHeight ?? null,
  ])
}

/** The bytes a staged item uploads: compressed output when it exists,
 * the original file otherwise (unchanged / error / passthrough). */
export function stagedUploadFile(item: StagedImageItem): File {
  return item.result && item.status !== "error" ? item.result.file : item.file
}

/** Ready to send: compression settled (or failed — original is sent then). */
export function isUploadable(item: StagedImageItem): boolean {
  return (
    (item.status === "done" ||
      item.status === "unchanged" ||
      item.status === "error") &&
    item.uploadStatus !== "done"
  )
}

export function useImageCompression(options: CompressImageOptions = {}) {
  const [items, setItems] = useState<StagedImageItem[]>([])
  // itemsRef is the source of truth for async callbacks — every mutation
  // commits to the ref first, then mirrors into state (never inside a state
  // updater, which React may defer).
  const itemsRef = useRef<StagedImageItem[]>([])
  const queueRef = useRef<string[]>([])
  const runningRef = useRef(0)
  const controllersRef = useRef(new Map<string, AbortController>())
  const urlsRef = useRef(new Set<string>())
  const pumpRef = useRef<() => void>(() => {})
  const optionsRef = useRef(options)
  const keyRef = useRef(optionsKey(options))

  useEffect(() => {
    optionsRef.current = options
  })

  // Every live object URL is tracked so unmount cleanup revokes all of them,
  // including ones created after the effect ran.
  const trackUrl = useCallback((url: string) => {
    urlsRef.current.add(url)
    return url
  }, [])
  const releaseUrl = useCallback((url: string | null | undefined) => {
    if (!url) return
    URL.revokeObjectURL(url)
    urlsRef.current.delete(url)
  }, [])

  const commit = useCallback((next: StagedImageItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  const patchItem = useCallback(
    (id: string, patch: Partial<StagedImageItem>) => {
      commit(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      )
    },
    [commit],
  )

  // Self-recursion goes through pumpRef: a direct `pump()` call inside its own
  // useCallback would read the binding before its declaration finishes.
  const pump = useCallback(() => {
    while (
      runningRef.current < MAX_CONCURRENT &&
      queueRef.current.length > 0
    ) {
      const id = queueRef.current[0]
      const item = itemsRef.current.find((entry) => entry.id === id)
      if (!item || item.status !== "idle") {
        // Removed, already running, or settled — drop from the queue.
        queueRef.current.shift()
        continue
      }
      queueRef.current.shift()

      runningRef.current += 1
      const controller = new AbortController()
      controllersRef.current.set(id, controller)
      const startKey = keyRef.current
      patchItem(id, {
        status: "compressing",
        error: null,
        compressProgress: 0,
      })

      void compressImage(item.file, {
        ...optionsRef.current,
        signal: controller.signal,
        onProgress: (pct) => {
          if (!controller.signal.aborted) {
            patchItem(id, { compressProgress: pct })
          }
        },
      })
        .then((result) => {
          if (controller.signal.aborted) return
          // Settings changed mid-flight — re-run with the fresh options.
          if (startKey !== keyRef.current) {
            patchItem(id, { status: "idle", compressProgress: null })
            queueRef.current.push(id)
            return
          }
          const outputUrl =
            result.blob !== item.file
              ? trackUrl(URL.createObjectURL(result.blob))
              : null
          const prev = itemsRef.current.find((entry) => entry.id === id)
          releaseUrl(prev?.outputUrl)
          patchItem(id, {
            status: result.reduced ? "done" : "unchanged",
            result,
            outputUrl,
            width: result.width,
            height: result.height,
            compressProgress: 100,
            error: null,
          })
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          patchItem(id, {
            status: "error",
            error: err instanceof Error ? err.message : "compression failed",
            result: null,
            compressProgress: null,
          })
        })
        .finally(() => {
          controllersRef.current.delete(id)
          runningRef.current -= 1
          pumpRef.current()
        })
    }
  }, [patchItem, releaseUrl, trackUrl])

  useEffect(() => {
    pumpRef.current = pump
  }, [pump])

  /**
   * Stage new files; compressible ones start immediately (bounded to 3),
   * passthrough files are marked unchanged right away. `compress: false`
   * stages every file as original (toggle off — still shows compare cards).
   */
  const addFiles = useCallback(
    (files: File[], compress = true) => {
      if (files.length === 0) return
      const staged: StagedImageItem[] = files.map((file) => {
        const compressible = compress && isCompressibleImage(file)
        return {
          id: stageId(),
          file,
          name: file.name,
          passthrough: !compressible,
          previewUrl: trackUrl(URL.createObjectURL(file)),
          outputUrl: null,
          width: null,
          height: null,
          status: compressible ? "idle" : "unchanged",
          result: compressible
            ? null
            : {
                file,
                blob: file,
                width: 0,
                height: 0,
                outWidth: 0,
                outHeight: 0,
                originalSize: file.size,
                outputSize: file.size,
                reduced: false,
              },
          error: null,
          compressProgress: null,
          uploadStatus: "idle",
          uploadProgress: null,
        }
      })
      commit([...itemsRef.current, ...staged])
      queueRef.current.push(
        ...staged.filter((item) => item.status === "idle").map((i) => i.id),
      )
      // Probe dims for passthrough items (best-effort — videos stay null).
      for (const item of staged) {
        if (item.passthrough) {
          void probeImageSize(item.file)
            .then(({ width, height }) =>
              patchItem(item.id, { width, height }),
            )
            .catch(() => undefined)
        }
      }
      pump()
    },
    [commit, patchItem, pump, trackUrl],
  )

  const remove = useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort()
      controllersRef.current.delete(id)
      queueRef.current = queueRef.current.filter((q) => q !== id)
      const doomed = itemsRef.current.find((item) => item.id === id)
      if (doomed) {
        releaseUrl(doomed.previewUrl)
        releaseUrl(doomed.outputUrl)
      }
      commit(itemsRef.current.filter((item) => item.id !== id))
    },
    [commit, releaseUrl],
  )

  /** Re-run compression for a settled item (error retry or settings change). */
  const requeue = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id)
      if (!item || item.passthrough) return
      if (item.status === "compressing" || item.status === "idle") return
      if (item.uploadStatus === "uploading" || item.uploadStatus === "done") {
        return
      }
      releaseUrl(item.outputUrl)
      patchItem(id, {
        status: "idle",
        result: null,
        error: null,
        outputUrl: null,
        compressProgress: null,
      })
      queueRef.current.push(id)
      pump()
    },
    [patchItem, pump, releaseUrl],
  )

  const clear = useCallback(() => {
    for (const controller of controllersRef.current.values()) {
      controller.abort()
    }
    controllersRef.current.clear()
    queueRef.current = []
    for (const item of itemsRef.current) {
      releaseUrl(item.previewUrl)
      releaseUrl(item.outputUrl)
    }
    commit([])
  }, [commit, releaseUrl])

  /** Drop items that finished uploading — keeps errors visible for retry. */
  const removeFinished = useCallback(() => {
    const doneIds = itemsRef.current
      .filter((item) => item.uploadStatus === "done")
      .map((item) => item.id)
    for (const id of doneIds) remove(id)
  }, [remove])

  /** Patch upload bookkeeping (uploadStatus / uploadProgress). */
  const updateItem = patchItem

  // Settings changed — re-compress every settled, not-yet-uploaded item so the
  // compare cards always reflect what will actually be sent. Debounced: the
  // quality slider fires per tick.
  const serialized = optionsKey(options)
  useEffect(() => {
    if (serialized === keyRef.current) return
    keyRef.current = serialized
    const timer = setTimeout(() => {
      for (const item of itemsRef.current) {
        if (
          item.status === "done" ||
          item.status === "unchanged" ||
          item.status === "error"
        ) {
          requeue(item.id)
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [serialized, requeue])

  // Revoke every live object URL + abort in-flight work on unmount. The map /
  // set are captured (not `.current` at cleanup time) — both are mutated in
  // place, so the copies always see the latest contents.
  useEffect(() => {
    const controllers = controllersRef.current
    const urls = urlsRef.current
    return () => {
      for (const controller of controllers.values()) {
        controller.abort()
      }
      controllers.clear()
      for (const url of urls) {
        URL.revokeObjectURL(url)
      }
      urls.clear()
      itemsRef.current = []
    }
  }, [])

  const stats = useMemo<CompressionBatchStats>(() => {
    let compressed = 0
    let unchanged = 0
    let failed = 0
    let pending = 0
    let originalBytes = 0
    let outputBytes = 0
    for (const item of items) {
      if (item.status === "error") {
        failed += 1
        continue // failed files never count in byte totals
      }
      if (item.status === "idle" || item.status === "compressing") {
        pending += 1
        continue
      }
      if (item.result) {
        if (item.result.reduced) compressed += 1
        else unchanged += 1
        originalBytes += item.result.originalSize
        outputBytes += item.result.outputSize
      }
    }
    const savedBytes = Math.max(0, originalBytes - outputBytes)
    return {
      total: items.length,
      pending,
      compressed,
      unchanged,
      failed,
      originalBytes,
      outputBytes,
      savedBytes,
      savedPct:
        originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0,
    }
  }, [items])

  const isCompressing = items.some(
    (item) => item.status === "idle" || item.status === "compressing",
  )

  return {
    items,
    stats,
    isCompressing,
    addFiles,
    remove,
    requeue,
    clear,
    removeFinished,
    updateItem,
  }
}
