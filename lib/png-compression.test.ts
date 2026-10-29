import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { crc32, deflateSync } from "node:zlib"

import { initSync, optimise } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js"
import UPNG from "upng-js"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import {
  hasPngSignature,
  optimizePngBytes,
  PngFormatError,
  readPngHeader,
  type PngCodec,
} from "@/lib/png-compression-core"
import { compressPng, isPngFile } from "@/lib/png-compression"

const require = createRequire(import.meta.url)
const codec: PngCodec = {
  optimise: (bytes, level) => optimise(bytes, level, false, false),
}
const TARGET = 256_000

beforeAll(() => {
  const wasmPath = path.join(
    path.dirname(require.resolve("@jsquash/oxipng/package.json")),
    "codec/pkg/squoosh_oxipng_bg.wasm",
  )
  initSync(readFileSync(wasmPath))
})

// --- fixtures ---------------------------------------------------------------

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), Buffer.from(data)])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([len, body, crc])
}

/** Deliberately unoptimised RGBA PNG: filter 0, zlib level 0 (stored). */
function rawPng(
  w: number,
  h: number,
  rgba: Uint8Array,
  extraChunks: Buffer[] = [],
): Uint8Array {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const rows = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    rows[y * (w * 4 + 1)] = 0
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(
      rows,
      y * (w * 4 + 1) + 1,
    )
  }
  return new Uint8Array(
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      ...extraChunks,
      chunk("IDAT", deflateSync(rows, { level: 0 })),
      chunk("IEND", new Uint8Array()),
    ]),
  )
}

/** Seeded PRNG so fixtures are deterministic. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

/** Gradient with a fully transparent band and a semi-transparent band. */
function transparentGradient(w: number, h: number): Uint8Array {
  const px = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      px[i] = (x * 255) / w
      px[i + 1] = (y * 255) / h
      px[i + 2] = 128
      px[i + 3] = y < h / 4 ? 0 : y < h / 2 ? 128 : 255
    }
  }
  return px
}

/** Photographic-like: smooth gradient plus sensor-style noise. */
function photoLike(w: number, h: number, seed = 1, noise = 24): Uint8Array {
  const r = rng(seed)
  const px = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const n = () => (r() - 0.5) * noise
      px[i] = Math.max(0, Math.min(255, (x / w) * 200 + 30 + n()))
      px[i + 1] = Math.max(0, Math.min(255, (y / h) * 180 + 40 + n()))
      px[i + 2] = Math.max(0, Math.min(255, ((x + y) / (w + h)) * 220 + n()))
      px[i + 3] = 255
    }
  }
  return px
}

function decodeRgba(bytes: Uint8Array): Uint8Array {
  const img = UPNG.decode(bytes.slice().buffer)
  return new Uint8Array(UPNG.toRGBA8(img)[0])
}

// --- validation -------------------------------------------------------------

describe("PNG validation", () => {
  it("accepts a real PNG and reads its header", () => {
    const png = rawPng(4, 3, transparentGradient(4, 3))
    expect(hasPngSignature(png)).toBe(true)
    expect(readPngHeader(png)).toMatchObject({ width: 4, height: 3, animated: false })
  })

  it("rejects non-PNG bytes (JPEG signature, random data, empty)", async () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46])
    await expect(optimizePngBytes(jpeg, { targetBytes: TARGET }, codec)).rejects.toBeInstanceOf(PngFormatError)
    const noise = new Uint8Array(500).map((_, i) => (i * 37) & 255)
    await expect(optimizePngBytes(noise, { targetBytes: TARGET }, codec)).rejects.toBeInstanceOf(PngFormatError)
    await expect(optimizePngBytes(new Uint8Array(), { targetBytes: TARGET }, codec)).rejects.toBeInstanceOf(PngFormatError)
  })

  it("rejects a truncated PNG (signature + partial IHDR)", async () => {
    const png = rawPng(8, 8, transparentGradient(8, 8)).slice(0, 20)
    await expect(optimizePngBytes(png, { targetBytes: 0 }, codec)).rejects.toBeInstanceOf(PngFormatError)
  })

  it("fails safely on corrupted image data (valid header, garbage IDAT)", async () => {
    const good = rawPng(64, 64, photoLike(64, 64))
    const bad = good.slice()
    // Smash the middle of the IDAT payload — header & chunk walk stay valid.
    for (let i = 60; i < bad.length - 20; i++) bad[i] = 0xaa
    await expect(optimizePngBytes(bad, { targetBytes: 1 }, codec)).rejects.toThrow()
  })

  it("isPngFile sniffs content, not the name/MIME", async () => {
    const png = rawPng(2, 2, transparentGradient(2, 2))
    expect(await isPngFile(new Blob([png as BlobPart], { type: "image/jpeg" }))).toBe(true)
    expect(await isPngFile(new Blob([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])], { type: "image/png" }))).toBe(false)
  })
})

// --- lossless ---------------------------------------------------------------

describe("lossless mode", () => {
  it("skips a PNG that is already under the target (bytes untouched)", async () => {
    const png = rawPng(32, 32, transparentGradient(32, 32))
    const out = await optimizePngBytes(png, { targetBytes: TARGET }, codec)
    expect(out.method).toBe("original")
    expect(out.bytes).toBe(png)
    expect(out.targetMet).toBe(true)
  })

  it("shrinks a large transparent PNG with every pixel and alpha preserved", async () => {
    const w = 600
    const h = 400
    const px = transparentGradient(w, h)
    const png = rawPng(w, h, px)
    expect(png.length).toBeGreaterThan(TARGET)

    const out = await optimizePngBytes(png, { targetBytes: TARGET }, codec)
    expect(out.method).toBe("lossless")
    expect(hasPngSignature(out.bytes)).toBe(true)
    expect(out.finalSize).toBeLessThan(png.length)
    expect(out.targetMet).toBe(out.finalSize <= TARGET)
    expect(decodeRgba(out.bytes)).toEqual(px)
    console.info(`[transparent gradient ${w}x${h}] ${png.length} → ${out.finalSize} bytes`)
  })

  it("is lossless on photographic content and reports a missed target honestly", async () => {
    const w = 800
    const h = 600
    const px = photoLike(w, h)
    const png = rawPng(w, h, px)
    const out = await optimizePngBytes(png, { targetBytes: TARGET }, codec)
    expect(out.finalSize).toBeLessThanOrEqual(png.length)
    expect(decodeRgba(out.bytes)).toEqual(px)
    // Noisy photo content cannot fit 250 KB losslessly at 800x600 — must say so.
    expect(out.finalSize).toBeGreaterThan(TARGET)
    expect(out.targetMet).toBe(false)
    console.info(`[photo lossless ${w}x${h}] ${png.length} → ${out.finalSize} bytes (target met: ${out.targetMet})`)
  })

  it("never grows an already-optimised PNG", async () => {
    const png = rawPng(400, 300, photoLike(400, 300, 7))
    const once = (await optimizePngBytes(png, { targetBytes: 1 }, codec)).bytes
    const twice = await optimizePngBytes(once, { targetBytes: 1 }, codec)
    expect(twice.finalSize).toBeLessThanOrEqual(once.length)
  })

  it("does not apply colour reduction unless explicitly allowed", async () => {
    const png = rawPng(800, 600, photoLike(800, 600, 3))
    const out = await optimizePngBytes(png, { targetBytes: TARGET }, codec)
    expect(out.method).not.toBe("reduced")
    expect(out.colors).toBeNull()
  })

  it("passes animated PNGs through untouched", async () => {
    const actl = chunk("acTL", new Uint8Array([0, 0, 0, 2, 0, 0, 0, 0]))
    const png = rawPng(300, 300, photoLike(300, 300), [actl])
    const out = await optimizePngBytes(png, { targetBytes: 1, allowReducedColors: true }, codec)
    expect(out.method).toBe("original")
    expect(out.bytes).toBe(png)
  })

  it("honours cancellation", async () => {
    const png = rawPng(200, 200, photoLike(200, 200))
    await expect(optimizePngBytes(png, { targetBytes: 1 }, codec, () => true)).rejects.toThrow("aborted")
  })
})

// --- reduced colours ----------------------------------------------------------

describe("reduced-colour mode (opt-in)", () => {
  it("reaches the target on a photo while staying PNG", async () => {
    const w = 800
    const h = 600
    const png = rawPng(w, h, photoLike(w, h, 5, 10))
    const lossless = await optimizePngBytes(png, { targetBytes: TARGET }, codec)
    const out = await optimizePngBytes(png, { targetBytes: TARGET, allowReducedColors: true }, codec)
    expect(hasPngSignature(out.bytes)).toBe(true)
    expect(readPngHeader(out.bytes)).toMatchObject({ width: w, height: h })
    expect(out.finalSize).toBeLessThan(lossless.finalSize)
    expect(out.method).toBe("reduced")
    expect([256, 128, 64]).toContain(out.colors)
    expect(out.targetMet).toBe(out.finalSize <= TARGET)
    console.info(
      `[photo reduced ${w}x${h}] ${png.length} → lossless ${lossless.finalSize} → reduced(${out.colors}) ${out.finalSize} bytes (target met: ${out.targetMet})`,
    )
  })

  it("keeps fully transparent pixels transparent", async () => {
    const w = 700
    const h = 500
    const px = transparentGradient(w, h)
    // Add noise to the opaque half so lossless can't hit a tiny target.
    const r = rng(9)
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] === 255) px[i] = Math.min(255, px[i] + r() * 40)
    }
    const png = rawPng(w, h, px)
    const out = await optimizePngBytes(png, { targetBytes: 20_000, allowReducedColors: true }, codec)
    expect(out.method).toBe("reduced")
    const dec = decodeRgba(out.bytes)
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] === 0) expect(dec[i + 3]).toBe(0)
      if (px[i + 3] === 255) expect(dec[i + 3]).toBe(255)
    }
  })

  it("stops at the quality floor and reports a still-oversized result", async () => {
    // Pure noise defeats both deflate and quantisation.
    const w = 900
    const h = 900
    const r = rng(11)
    const px = new Uint8Array(w * h * 4).map((_, i) => (i % 4 === 3 ? 255 : r() * 256))
    const png = rawPng(w, h, px)
    const out = await optimizePngBytes(png, { targetBytes: TARGET, allowReducedColors: true }, codec)
    expect(out.colors === null || out.colors >= 64).toBe(true)
    expect(out.finalSize).toBeGreaterThan(TARGET)
    expect(out.targetMet).toBe(false)
    expect(out.finalSize).toBeLessThanOrEqual(png.length)
  })
})

// --- browser wrapper (Worker stubbed with the same core) ---------------------

class FakeWorker {
  onmessage: ((e: { data: unknown }) => void) | null = null
  onerror: ((e: { message: string }) => void) | null = null
  terminated = false
  static instances: FakeWorker[] = []
  constructor() {
    FakeWorker.instances.push(this)
  }
  postMessage(msg: { buffer: ArrayBuffer; options: { targetBytes: number; allowReducedColors: boolean } }) {
    void optimizePngBytes(new Uint8Array(msg.buffer), msg.options, codec)
      .then((out) => this.onmessage?.({ data: { ok: true, ...out } }))
      .catch((err: Error) =>
        this.onmessage?.({ data: { ok: false, error: err.message, invalid: err.name === "PngFormatError" } }),
      )
  }
  terminate() {
    this.terminated = true
  }
}

describe("compressPng (upload-pipeline wrapper)", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeWorker.instances = []
  })

  it("returns a .png File with image/png, the original name, and honest stats", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const png = rawPng(600, 400, transparentGradient(600, 400))
    const file = new File([png as BlobPart], "مەحمووی حەمەی.png", { type: "image/png" })
    const res = await compressPng(file, { targetBytes: TARGET })
    expect(res.file.name).toBe("مەحمووی حەمەی.png")
    expect(res.file.type).toBe("image/png")
    expect(res.finalSize).toBe(res.file.size)
    expect(res.finalSize).toBeLessThan(file.size)
    expect(res.ratio).toBeCloseTo(res.finalSize / file.size)
    expect(res.targetMet).toBe(res.finalSize <= TARGET)
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true)
  })

  it("returns the original File object when nothing needs doing", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const file = new File([rawPng(16, 16, transparentGradient(16, 16)) as BlobPart], "a.png", { type: "image/png" })
    const res = await compressPng(file, { targetBytes: TARGET })
    expect(res.file).toBe(file)
    expect(res.method).toBe("original")
  })

  it("surfaces invalid PNG data as PngFormatError and cleans up the worker", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const file = new File([new Uint8Array(64).fill(7)], "fake.png", { type: "image/png" })
    await expect(compressPng(file)).rejects.toBeInstanceOf(PngFormatError)
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true)
  })

  it("repeated runs are independent (one worker per job, all terminated)", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const file = new File([rawPng(300, 300, photoLike(300, 300)) as BlobPart], "r.png", { type: "image/png" })
    const a = await compressPng(file, { targetBytes: 1 })
    const b = await compressPng(file, { targetBytes: 1 })
    expect(a.finalSize).toBe(b.finalSize)
    expect(FakeWorker.instances).toHaveLength(2)
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true)
  })
})
