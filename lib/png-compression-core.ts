import UPNG from "upng-js"

/**
 * Environment-agnostic PNG optimisation core — runs in the compression Web
 * Worker in the browser and directly under Node in tests. The output is
 * ALWAYS a PNG: no format conversion, no resizing, no cropping.
 *
 * Two clearly separated stages:
 * 1. Lossless — oxipng re-encodes the PNG stream (filters, deflate, bit
 *    depth / palette reductions that are exact). Every pixel and alpha value
 *    is preserved (`optimiseAlpha` stays off).
 * 2. Reduced colours — opt-in only. Quantises to a palette (256 → 128 → 64
 *    colours) with alpha kept via tRNS, then runs oxipng again. Stops at the
 *    first step that meets the target; never goes below `minColors`.
 *
 * The smallest valid candidate wins and is never larger than the input.
 * `targetMet` reports the truth — a miss is a miss.
 */

export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** 250 KB — the default PNG target (250 × 1024 = 256,000 bytes). */
export const DEFAULT_PNG_TARGET_BYTES = 256_000

/** Decoding for colour reduction holds W×H×4 bytes; above this it is skipped
 * (decompression-bomb / memory guard). 40 MP ≈ 160 MB RGBA. */
export const DEFAULT_MAX_REDUCE_PIXELS = 40_000_000

const REDUCED_COLOR_STEPS = [256, 128, 64] as const

export class PngFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PngFormatError"
  }
}

export type PngHeader = {
  width: number
  height: number
  bitDepth: number
  colorType: number
  /** Animated PNG (acTL before IDAT) — passed through untouched. */
  animated: boolean
}

export type PngMethod = "original" | "lossless" | "reduced"

export type PngOptimizeOptions = {
  /** Target size in bytes; `<= 0` → no target (lossless pass only). */
  targetBytes: number
  /** Allow the lossy palette stage. Default false. */
  allowReducedColors?: boolean
  /** Lowest palette size the reduced stage may use. Default 64. */
  minColors?: number
  maxReducePixels?: number
}

export type PngOptimizeOutcome = {
  bytes: Uint8Array
  method: PngMethod
  /** Palette size when `method === "reduced"`, else null. */
  colors: number | null
  width: number
  height: number
  originalSize: number
  finalSize: number
  targetBytes: number
  /** True when the final bytes fit the target (always true with no target). */
  targetMet: boolean
}

export type PngCodec = {
  /** Lossless oxipng pass. Must return a valid PNG. */
  optimise: (bytes: Uint8Array, level: number) => Promise<Uint8Array> | Uint8Array
}

export function hasPngSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) return false
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b)
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  )
}

function chunkType(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  )
}

/** Validates signature + IHDR and walks chunk headers up to IDAT. Throws
 * `PngFormatError` for anything that is not a structurally valid PNG. */
export function readPngHeader(bytes: Uint8Array): PngHeader {
  if (!hasPngSignature(bytes)) throw new PngFormatError("not a PNG file")
  if (bytes.length < 33 || chunkType(bytes, 12) !== "IHDR") {
    throw new PngFormatError("PNG header is missing or truncated")
  }
  const width = readU32(bytes, 16)
  const height = readU32(bytes, 20)
  if (width === 0 || height === 0) {
    throw new PngFormatError("PNG has zero dimensions")
  }
  let animated = false
  let sawIdat = false
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const len = readU32(bytes, offset)
    const type = chunkType(bytes, offset + 4)
    if (type === "acTL") animated = true
    if (type === "IDAT") {
      sawIdat = true
      break
    }
    offset += 12 + len
  }
  if (!sawIdat) throw new PngFormatError("PNG has no image data")
  return {
    width,
    height,
    bitDepth: bytes[24],
    colorType: bytes[25],
    animated,
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
    ? (bytes.buffer as ArrayBuffer)
    : (bytes.slice().buffer as ArrayBuffer)
}

/** Decode to straight (non-premultiplied) RGBA8 — exact, no canvas. */
function decodeRgba(bytes: Uint8Array): ArrayBuffer {
  const img = UPNG.decode(toArrayBuffer(bytes))
  const frames = UPNG.toRGBA8(img)
  if (!frames[0]) throw new PngFormatError("PNG could not be decoded")
  return frames[0]
}

export async function optimizePngBytes(
  input: Uint8Array,
  options: PngOptimizeOptions,
  codec: PngCodec,
  isAborted: () => boolean = () => false,
): Promise<PngOptimizeOutcome> {
  const header = readPngHeader(input)
  const targetBytes = options.targetBytes > 0 ? options.targetBytes : 0
  const fits = (n: number) => targetBytes === 0 || n <= targetBytes

  let best: Uint8Array = input
  let method: PngMethod = "original"
  let colors: number | null = null

  const outcome = (): PngOptimizeOutcome => ({
    bytes: best,
    method,
    colors,
    width: header.width,
    height: header.height,
    originalSize: input.length,
    finalSize: best.length,
    targetBytes,
    targetMet: fits(best.length),
  })
  const consider = (cand: Uint8Array, m: PngMethod, c: number | null) => {
    if (cand.length > 0 && cand.length < best.length && hasPngSignature(cand)) {
      best = cand
      method = m
      colors = c
    }
  }
  const checkAbort = () => {
    if (isAborted()) throw new Error("aborted")
  }

  // Already small enough, or animated (re-encoding would drop frames).
  if ((targetBytes > 0 && input.length <= targetBytes) || header.animated) {
    return outcome()
  }

  const pixels = header.width * header.height
  // oxipng level 2 is the balanced default; very large images use level 1
  // so lower-powered machines stay responsive.
  const level = pixels > 12_000_000 ? 1 : 2

  consider(await codec.optimise(input, level), "lossless", null)
  checkAbort()

  if (fits(best.length) || !options.allowReducedColors) return outcome()
  if (pixels > (options.maxReducePixels ?? DEFAULT_MAX_REDUCE_PIXELS)) {
    return outcome()
  }

  const rgba = decodeRgba(input)
  checkAbort()
  const minColors = options.minColors ?? 64
  for (const n of REDUCED_COLOR_STEPS) {
    if (n < minColors) break
    const quantized = new Uint8Array(
      UPNG.encode([rgba], header.width, header.height, n),
    )
    checkAbort()
    consider(await codec.optimise(quantized, level), "reduced", n)
    checkAbort()
    if (fits(best.length)) break
  }
  return outcome()
}
