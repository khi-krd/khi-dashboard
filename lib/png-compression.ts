import {
  DEFAULT_PNG_TARGET_BYTES,
  hasPngSignature,
  PngFormatError,
  type PngMethod,
  type PngOptimizeOutcome,
} from "@/lib/png-compression-core"

export { DEFAULT_PNG_TARGET_BYTES, PngFormatError, hasPngSignature }
export type { PngMethod }

export type CompressPngOptions = {
  /** Target size in bytes. Default 256,000 (250 KB); `<= 0` → no target. */
  targetBytes?: number
  /** Opt-in lossy palette stage (keeps PNG + alpha). Default false. */
  allowReducedColors?: boolean
  signal?: AbortSignal
}

export type CompressPngResult = {
  /** Always a PNG: original filename, `image/png`. */
  file: File
  originalSize: number
  finalSize: number
  /** finalSize / originalSize (1 = unchanged). */
  ratio: number
  width: number
  height: number
  method: PngMethod
  colors: number | null
  targetBytes: number
  targetMet: boolean
}

/** Reads only the 8 signature bytes — format is decided by content, never by
 * the filename or the browser-reported MIME type. */
export async function isPngFile(file: Blob): Promise<boolean> {
  if (file.size < 8) return false
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  return hasPngSignature(head)
}

function runInWorker(
  buffer: ArrayBuffer,
  options: { targetBytes: number; allowReducedColors: boolean },
  signal?: AbortSignal,
): Promise<PngOptimizeOutcome> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./png-compression.worker.ts", import.meta.url),
      { type: "module" },
    )
    const done = () => {
      worker.terminate()
      signal?.removeEventListener("abort", onAbort)
    }
    const onAbort = () => {
      done()
      reject(new Error("aborted"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })
    worker.onmessage = (event) => {
      done()
      const data = event.data
      if (data.ok) resolve(data as PngOptimizeOutcome)
      else if (data.invalid) reject(new PngFormatError(data.error))
      else reject(new Error(data.error))
    }
    worker.onerror = (event) => {
      done()
      reject(new Error(event.message || "PNG worker failed"))
    }
    worker.postMessage({ buffer, options }, [buffer])
  })
}

/**
 * Optimise a PNG without leaving PNG: lossless oxipng first, then — only when
 * `allowReducedColors` is on and the target is still missed — a palette
 * reduction that keeps transparency. Runs in a Web Worker; aborting the
 * signal terminates it. Never returns bytes larger than the input.
 */
export async function compressPng(
  file: File,
  options: CompressPngOptions = {},
): Promise<CompressPngResult> {
  const {
    targetBytes = DEFAULT_PNG_TARGET_BYTES,
    allowReducedColors = false,
    signal,
  } = options
  if (signal?.aborted) throw new Error("aborted")

  const buffer = await file.arrayBuffer()
  const out = await runInWorker(
    buffer,
    { targetBytes, allowReducedColors },
    signal,
  )
  if (signal?.aborted) throw new Error("aborted")

  const outFile =
    out.method === "original"
      ? file
      : new File([out.bytes as BlobPart], file.name, {
          type: "image/png",
          lastModified: file.lastModified,
        })

  return {
    file: outFile,
    originalSize: file.size,
    finalSize: outFile.size,
    ratio: file.size > 0 ? outFile.size / file.size : 1,
    width: out.width,
    height: out.height,
    method: out.method,
    colors: out.colors,
    targetBytes: out.targetBytes,
    targetMet: out.targetMet,
  }
}
