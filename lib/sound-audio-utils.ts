import { guessFileFormatFromName } from "@/lib/sound-format"

export type AudioFileMetaPatch = {
  durationSeconds: number
  sizeBytes: number
  fileFormat: string
  bitRate?: string
  sampleRate?: string
  publishmentYear?: number | null
  genre?: string
  title?: string
  form?: string
}

function estimateBitRateKbps(sizeBytes: number, durationSeconds: number): string {
  if (durationSeconds <= 0 || sizeBytes <= 0) return ""
  const kbps = Math.round((sizeBytes * 8) / durationSeconds / 1000)
  return kbps > 0 ? `${kbps} kbps` : ""
}

const MPEG1_SAMPLE_RATES = [44_100, 48_000, 32_000] as const
const MPEG2_SAMPLE_RATES = [22_050, 24_000, 16_000] as const
const MPEG25_SAMPLE_RATES = [11_025, 12_000, 8000] as const

/** Human-readable sample rate (e.g. 44100 → "44.1 kHz"). */
export function formatSampleRateHz(hz: number): string {
  if (!Number.isFinite(hz) || hz <= 0) return ""
  if (hz >= 1000) {
    const khz = hz / 1000
    const label = Number.isInteger(khz) ? String(khz) : khz.toFixed(1)
    return `${label} kHz`
  }
  return `${Math.round(hz)} Hz`
}

function id3v2TagSize(bytes: Uint8Array): number {
  if (bytes.length < 10) return 0
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0
  const size =
    ((bytes[6]! & 0x7f) << 21) |
    ((bytes[7]! & 0x7f) << 14) |
    ((bytes[8]! & 0x7f) << 7) |
    (bytes[9]! & 0x7f)
  return 10 + size
}

function parseMp3FrameSampleRate(
  b0: number,
  b1: number,
  b2: number,
): number | null {
  if (b0 !== 0xff || (b1 & 0xe0) !== 0xe0) return null

  const layer = (b1 >> 1) & 0x03
  if (layer !== 0x01) return null

  const bitrateIndex = (b2 >> 4) & 0x0f
  if (bitrateIndex === 0 || bitrateIndex === 0x0f) return null

  const samplingIndex = (b2 >> 2) & 0x03
  if (samplingIndex === 0x03) return null

  const versionBits = (b1 >> 3) & 0x03
  let rates: readonly number[]
  if (versionBits === 0x03) rates = MPEG1_SAMPLE_RATES
  else if (versionBits === 0x02) rates = MPEG2_SAMPLE_RATES
  else if (versionBits === 0x00) rates = MPEG25_SAMPLE_RATES
  else return null

  return rates[samplingIndex] ?? null
}

function probeWavSampleRateHz(bytes: Uint8Array): number | null {
  if (bytes.length < 28) return null
  if (
    bytes[0] !== 0x52 ||
    bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 ||
    bytes[3] !== 0x46
  ) {
    return null
  }
  if (
    bytes[8] !== 0x57 ||
    bytes[9] !== 0x41 ||
    bytes[10] !== 0x56 ||
    bytes[11] !== 0x45
  ) {
    return null
  }
  const hz =
    bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16) | (bytes[27]! << 24)
  return hz > 0 && hz < 384_000 ? hz : null
}

function probeMp3SampleRateHz(bytes: Uint8Array): number | null {
  const start = id3v2TagSize(bytes)
  const end = Math.min(bytes.length - 4, start + 512 * 1024)
  for (let i = start; i < end; i++) {
    const hz = parseMp3FrameSampleRate(bytes[i]!, bytes[i + 1]!, bytes[i + 2]!)
    if (hz != null) return hz
  }
  return null
}

function probeSampleRateFromBytes(bytes: Uint8Array, mime: string): number | null {
  const wav = probeWavSampleRateHz(bytes)
  if (wav != null) return wav
  if (
    mime.includes("mpeg") ||
    mime.includes("mp3") ||
    bytes[0] === 0xff ||
    id3v2TagSize(bytes) > 0
  ) {
    return probeMp3SampleRateHz(bytes)
  }
  return probeMp3SampleRateHz(bytes)
}

const WEB_AUDIO_SAMPLE_RATE_MAX_BYTES = 48 * 1024 * 1024

async function probeSampleRateViaWebAudio(file: File): Promise<number | null> {
  if (file.size > WEB_AUDIO_SAMPLE_RATE_MAX_BYTES) return null
  if (typeof window === "undefined") return null

  let ctx: AudioContext | null = null
  try {
    ctx = new AudioContext()
    const buffer = await file.arrayBuffer()
    const decoded = await ctx.decodeAudioData(buffer.slice(0))
    const hz = decoded.sampleRate
    return hz > 0 ? hz : null
  } catch {
    return null
  } finally {
    void ctx?.close()
  }
}

async function probeSampleRateFromFile(file: File): Promise<string | undefined> {
  const headSize = Math.min(file.size, 512 * 1024)
  const head = new Uint8Array(await file.slice(0, headSize).arrayBuffer())
  let hz = probeSampleRateFromBytes(head, file.type)

  if (hz == null) {
    hz = await probeSampleRateViaWebAudio(file)
  }

  if (hz == null) return undefined
  return formatSampleRateHz(hz)
}

function probeDurationSeconds(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio")
    audio.preload = "metadata"

    let settled = false
    const done = (seconds: number) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      audio.src = ""
      resolve(seconds)
    }

    const read = () => {
      const d = audio.duration
      if (Number.isFinite(d) && d > 0) done(Math.floor(d))
    }

    audio.addEventListener("loadedmetadata", read)
    audio.addEventListener("durationchange", read)
    audio.addEventListener("error", () => done(0), { once: true })

    const timer = window.setTimeout(() => done(0), 15_000)
    audio.src = url
    audio.load()
  })
}

async function readId3Tags(file: File): Promise<Partial<AudioFileMetaPatch>> {
  if (typeof window === "undefined") return {}

  try {
    const { default: jsmediatags } = await import("jsmediatags")
    return await new Promise((resolve) => {
      jsmediatags.read(file, {
        onSuccess: (result: { tags: Record<string, unknown> }) => {
          const tags = result.tags
          const title =
            typeof tags.title === "string" ? tags.title.trim() : undefined
          const genre =
            typeof tags.genre === "string" ? tags.genre.trim() : undefined
          const form =
            typeof tags.album === "string" ? tags.album.trim() : undefined
          const yearRaw = tags.year
          const yearNum =
            typeof yearRaw === "string" || typeof yearRaw === "number"
              ? parseInt(String(yearRaw), 10)
              : NaN
          const publishmentYear =
            Number.isFinite(yearNum) && yearNum >= 1900 && yearNum <= 2100
              ? yearNum
              : null

          let durationSeconds: number | undefined
          const lengthRaw = tags.length
          if (lengthRaw != null && lengthRaw !== "") {
            const sec = parseInt(String(lengthRaw), 10)
            if (Number.isFinite(sec) && sec > 0) durationSeconds = sec
          }

          resolve({
            ...(title ? { title } : {}),
            ...(genre ? { genre } : {}),
            ...(form ? { form } : {}),
            publishmentYear,
            ...(durationSeconds != null ? { durationSeconds } : {}),
          })
        },
        onError: () => resolve({}),
      })
    })
  } catch {
    return {}
  }
}

/** Immediate fields available before async probe (keeps UI responsive). */
export function audioFileMetaFromFile(file: File): Pick<
  AudioFileMetaPatch,
  "sizeBytes" | "fileFormat"
> {
  return {
    sizeBytes: file.size,
    fileFormat: guessFileFormatFromName(file.name),
  }
}

export async function applyAudioFileMeta(file: File): Promise<AudioFileMetaPatch> {
  const sizeBytes = file.size
  const fileFormat = guessFileFormatFromName(file.name)
  const url = URL.createObjectURL(file)

  let durationSeconds = 0
  try {
    durationSeconds = await probeDurationSeconds(url)
  } finally {
    URL.revokeObjectURL(url)
  }

  const [id3, sampleRate] = await Promise.all([
    readId3Tags(file),
    probeSampleRateFromFile(file),
  ])

  const resolvedDuration =
    durationSeconds > 0 ? durationSeconds : (id3.durationSeconds ?? 0)
  const bitRate = estimateBitRateKbps(sizeBytes, resolvedDuration)
  const { durationSeconds: _id3Dur, ...id3Rest } = id3

  return {
    durationSeconds: resolvedDuration,
    sizeBytes,
    fileFormat,
    ...(bitRate ? { bitRate } : {}),
    ...(sampleRate ? { sampleRate } : {}),
    ...id3Rest,
  }
}

/** Fallback when the visible player loads metadata (some codecs need playback context). */
export function metaPatchFromAudioElement(
  audio: HTMLAudioElement,
  opts: {
    stagedFile?: File | null
    sizeBytes?: number
    fileFormat?: string
  },
): Partial<AudioFileMetaPatch> {
  const durationSeconds =
    Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.floor(audio.duration)
      : 0

  const staged = opts.stagedFile
  const sizeBytes = staged?.size ?? opts.sizeBytes ?? 0
  const fileFormat =
    opts.fileFormat?.trim() ||
    (staged ? guessFileFormatFromName(staged.name) : "")

  const patch: Partial<AudioFileMetaPatch> = {
    ...(sizeBytes > 0 ? { sizeBytes } : {}),
    ...(fileFormat ? { fileFormat } : {}),
  }

  if (durationSeconds > 0) {
    patch.durationSeconds = durationSeconds
    if (sizeBytes > 0) {
      const bitRate = estimateBitRateKbps(sizeBytes, durationSeconds)
      if (bitRate) patch.bitRate = bitRate
    }
  }

  return patch
}

/** Apply element + optional file probes; safe to call repeatedly. */
export function mergeAudioMetaPatch(
  current: Partial<AudioFileMetaPatch>,
  incoming: Partial<AudioFileMetaPatch>,
): Partial<AudioFileMetaPatch> {
  return {
    ...current,
    ...incoming,
    ...(incoming.durationSeconds && incoming.durationSeconds > 0
      ? { durationSeconds: incoming.durationSeconds }
      : current.durationSeconds && current.durationSeconds > 0
        ? { durationSeconds: current.durationSeconds }
        : {}),
    ...(incoming.sizeBytes && incoming.sizeBytes > 0
      ? { sizeBytes: incoming.sizeBytes }
      : current.sizeBytes && current.sizeBytes > 0
        ? { sizeBytes: current.sizeBytes }
        : {}),
  }
}

/** Enrich patch with sample rate when the player has loaded (async). */
export function enrichMetaWithSampleRate(
  patch: Partial<AudioFileMetaPatch>,
  file: File,
): Promise<Partial<AudioFileMetaPatch>> {
  if (patch.sampleRate?.trim()) return Promise.resolve(patch)
  return probeSampleRateFromFile(file).then((sampleRate) =>
    sampleRate ? { ...patch, sampleRate } : patch,
  )
}
