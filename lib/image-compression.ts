import imageCompression, {
  type Options as LibOptions,
} from "browser-image-compression"

import {
  compressPng,
  DEFAULT_PNG_TARGET_BYTES,
  isPngFile,
  PngFormatError,
  type PngMethod,
} from "@/lib/png-compression"

/**
 * Client-side image compression built on `browser-image-compression`.
 *
 * Rules that keep this safe to sit in front of `uploadMedia`:
 * - The backend stays the validation authority — this only ever trades bytes
 *   for quality, never blocks a file.
 * - Never upload bigger than the original: when the compressed output is
 *   >= the input bytes, the original `File` is returned with
 *   `reduced: false`.
 * - Never resizes or converts: `alwaysKeepResolution` pins the source
 *   dimensions and `fileType` keeps the source format — a PNG stays a PNG
 *   at full size; only quality is traded for bytes.
 * - PNG/transparency is preserved — no format conversion ever happens.
 *   PNGs (detected by their signature bytes, not the name/MIME) take a
 *   dedicated path: lossless oxipng, plus an opt-in reduced-colour stage
 *   (`lib/png-compression.ts`), with their own target (default 250 KB).
 * - Animated formats (GIF) and vectors (SVG) are returned untouched — a
 *   canvas round-trip would flatten animation / rasterize the vector.
 */

/** Same-origin copy of the library UMD build — loaded by the compression
 * worker via `importScripts` (allowed under `script-src 'strict-dynamic'`).
 * Avoids the default jsdelivr CDN dependency at runtime. Must be ABSOLUTE:
 * the worker is a blob: URL, so a relative path would resolve against the
 * blob and fail. */
const WORKER_LIB_PATH = "/vendor/browser-image-compression.js"

function workerLibUrl(): string {
  return typeof window !== "undefined"
    ? new URL(WORKER_LIB_PATH, window.location.origin).href
    : WORKER_LIB_PATH
}

/** Image types worth a canvas round-trip. GIF/SVG are passed through. */
export function isCompressibleImage(file: File): boolean {
  return (
    file.type.startsWith("image/") &&
    file.type !== "image/gif" &&
    file.type !== "image/svg+xml"
  )
}

export type CompressImageOptions = {
  /** 0–1, mapped to the library `initialQuality`. Default 0.8. */
  quality?: number
  /** Target output size in KB. `undefined`/`<=0` → no size cap. Default 500. */
  maxSizeKB?: number
  /** PNG target in KB. `undefined`/`<=0` → no target. Default 250. */
  pngMaxSizeKB?: number
  /** Allow the lossy palette stage for PNGs. Default false (lossless only). */
  pngReducedColors?: boolean
  /** Abort the compression (used by the hook's cancel). */
  signal?: AbortSignal
  /** 0–100 progress from the library. */
  onProgress?: (progress: number) => void
}

export type CompressedImageResult = {
  /** The bytes to upload — compressed File when `reduced`, else the original. */
  file: File
  /** Preview blob — same object as `file`. */
  blob: Blob
  /** Original natural width/height. */
  width: number
  height: number
  /** Output dimensions — equal to width/height unless a resize was opted in. */
  outWidth: number
  outHeight: number
  originalSize: number
  outputSize: number
  /** True only when the output is strictly smaller than the input. */
  reduced: boolean
  /** Target that applied, in bytes (0/undefined → no target). */
  targetBytes?: number
  /** Whether `outputSize` fits `targetBytes` — reported, never assumed. */
  targetMet?: boolean
  /** PNG path only: how the bytes were produced. */
  pngMethod?: PngMethod
  /** PNG path only: palette size when `pngMethod === "reduced"`. */
  pngColors?: number | null
}

/** User-facing toggle state — percent quality for the 50–100 slider. */
export type CompressionSettings = {
  enabled: boolean
  /** 50–100 → `quality` 0.5–1.0. */
  qualityPct: number
  /** Target KB; `null` → no size cap. */
  maxSizeKB: number | null
  /** PNG target KB; `null` → no target. */
  pngMaxSizeKB: number | null
  /** Opt-in lossy palette reduction for PNGs (stays PNG, keeps alpha). */
  pngReducedColors: boolean
}

export const DEFAULT_COMPRESSION_SETTINGS: CompressionSettings = {
  enabled: true,
  qualityPct: 80,
  maxSizeKB: 500,
  pngMaxSizeKB: DEFAULT_PNG_TARGET_BYTES / 1024,
  pngReducedColors: false,
}

export function compressionSettingsToOptions(
  settings: CompressionSettings,
): CompressImageOptions {
  return {
    quality: settings.qualityPct / 100,
    maxSizeKB: settings.maxSizeKB ?? undefined,
    pngMaxSizeKB: settings.pngMaxSizeKB ?? 0,
    pngReducedColors: settings.pngReducedColors,
  }
}

/** Natural dimensions of an image File. Throws on corrupt/undecodable files. */
export async function probeImageSize(
  file: Blob,
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file)
      const dims = { width: bmp.width, height: bmp.height }
      bmp.close()
      if (dims.width > 0 && dims.height > 0) return dims
    } catch {
      // fall through to the HTMLImageElement path
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error("image decode failed"))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function runLibrary(
  file: File,
  options: LibOptions,
): Promise<File> {
  // The library's own worker calls `importScripts(libURL)` — same-origin here.
  // If the worker path fails (CSP edge cases, no Worker, blocked import), retry
  // once on the main thread before giving up.
  try {
    return await imageCompression(file, options)
  } catch (err) {
    if (options.signal?.aborted) throw err
    return await imageCompression(file, { ...options, useWebWorker: false })
  }
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressedImageResult> {
  const {
    quality = 0.8,
    maxSizeKB = 500,
    pngMaxSizeKB = DEFAULT_PNG_TARGET_BYTES / 1024,
    pngReducedColors = false,
    signal,
    onProgress,
  } = options

  if (file.size === 0) {
    throw new Error("empty file")
  }

  const { width, height } = await probeImageSize(file)

  const original = (targetBytes = 0): CompressedImageResult => ({
    file,
    blob: file,
    width,
    height,
    outWidth: width,
    outHeight: height,
    originalSize: file.size,
    outputSize: file.size,
    reduced: false,
    targetBytes,
    targetMet: targetBytes <= 0 || file.size <= targetBytes,
  })

  // GIF animation / SVG vectors: a canvas pass would destroy them — original.
  if (!isCompressibleImage(file)) return original()

  // PNG — routed by content, so a mislabelled file can't slip into the
  // wrong encoder. Output stays PNG with the original name.
  const isPng = await isPngFile(file)
  if (file.type === "image/png" && !isPng) {
    throw new PngFormatError("file is labelled PNG but is not PNG data")
  }
  if (isPng) {
    const png = await compressPng(file, {
      targetBytes: pngMaxSizeKB > 0 ? Math.round(pngMaxSizeKB * 1024) : 0,
      allowReducedColors: pngReducedColors,
      signal,
    })
    onProgress?.(100)
    const reduced = png.finalSize < file.size
    return {
      ...original(png.targetBytes),
      file: png.file,
      blob: png.file,
      outputSize: png.finalSize,
      reduced,
      targetMet: png.targetMet,
      pngMethod: png.method,
      pngColors: png.colors,
    }
  }

  const targetBytes =
    typeof maxSizeKB === "number" && maxSizeKB > 0 ? maxSizeKB * 1024 : 0

  // Quality-only compression: same format, same dimensions — no conversion,
  // no resizing. `alwaysKeepResolution` pins the source pixels.
  const libOptions: LibOptions = {
    maxSizeMB:
      typeof maxSizeKB === "number" && maxSizeKB > 0
        ? maxSizeKB / 1024
        : Number.POSITIVE_INFINITY,
    initialQuality: Math.min(1, Math.max(0.05, quality)),
    useWebWorker: true,
    libURL: workerLibUrl(),
    alwaysKeepResolution: true,
    fileType: file.type,
    signal,
    onProgress,
  }

  const out = await runLibrary(file, libOptions)
  if (signal?.aborted) throw new Error("aborted")

  // Never upload bigger than the original — keep the source bytes.
  if (!out || out.size === 0 || out.size >= file.size) {
    return original(targetBytes)
  }

  // The library renames after the MIME type (photo.jpg → photo.jpeg) —
  // keep the original filename and extension so the stored object matches.
  const outFile =
    out.name !== file.name
      ? new File([out], file.name, {
          type: out.type || file.type,
          lastModified: out.lastModified ?? file.lastModified,
        })
      : out

  return {
    ...original(targetBytes),
    file: outFile,
    blob: outFile,
    outputSize: outFile.size,
    reduced: true,
    targetMet: targetBytes <= 0 || outFile.size <= targetBytes,
  }
}
