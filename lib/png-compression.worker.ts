/// <reference lib="webworker" />
import initOxipng, {
  optimise,
} from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js"

import {
  optimizePngBytes,
  type PngOptimizeOptions,
} from "@/lib/png-compression-core"

/**
 * Dedicated worker for PNG optimisation — oxipng WASM + palette quantisation
 * run here so the dashboard UI never blocks. One worker per job: the caller
 * cancels by terminating it. The single-threaded oxipng build is imported
 * directly (the parallel one needs cross-origin isolation we don't have).
 */

type JobMessage = { buffer: ArrayBuffer; options: PngOptimizeOptions }

/** The bundler emits the .wasm as a hashed static asset and hands back a
 * root-relative path. This worker runs from a blob: URL, where a relative
 * fetch cannot resolve — so anchor it on the page origin explicitly. */
function wasmUrl(): URL {
  const asset = new URL(
    "../node_modules/@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm",
    import.meta.url,
  )
  return new URL(String(asset), self.location.origin)
}

let ready: Promise<unknown> | null = null

self.onmessage = async (event: MessageEvent<JobMessage>) => {
  const { buffer, options } = event.data
  try {
    ready ??= initOxipng(wasmUrl())
    await ready
    const out = await optimizePngBytes(new Uint8Array(buffer), options, {
      optimise: (bytes, level) => optimise(bytes, level, false, false),
    })
    const bytes = out.bytes.slice()
    self.postMessage({ ok: true, ...out, bytes }, [bytes.buffer])
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : "PNG optimisation failed",
      invalid: err instanceof Error && err.name === "PngFormatError",
    })
  }
}
