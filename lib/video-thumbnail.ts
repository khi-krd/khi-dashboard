/**
 * Client-side video frame capture — turns a picked video File or a remote
 * video URL into a JPEG File that can be uploaded as the poster/thumbnail.
 *
 * Works for same-origin or CORS-enabled URLs. Cross-origin sources that don't
 * send CORS headers leave the canvas tainted — `captureVideoFrame` resolves
 * null in that case so the caller can fall back to asking for an image file.
 */

export type VideoFrameSource =
  | { kind: "file"; file: File }
  | { kind: "url"; url: string }

const SEEK_FALLBACK_SECONDS = 0.5
const MAX_CAPTURE_SECONDS = 10
const JPEG_QUALITY = 0.82
const MAX_WIDTH = 1280

function loadVideo(src: string, crossOrigin: boolean): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    if (crossOrigin) video.crossOrigin = "anonymous"
    video.muted = true
    video.playsInline = true
    video.preload = "auto"

    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error("video load timed out"))
    }, 15_000)

    function cleanup() {
      window.clearTimeout(timer)
      video.onloadedmetadata = null
      video.onerror = null
    }

    video.onloadedmetadata = () => {
      cleanup()
      resolve(video)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error("video failed to load"))
    }

    video.src = src
  })
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error("seek timed out"))
    }, 10_000)

    function cleanup() {
      window.clearTimeout(timer)
      video.onseeked = null
      video.onerror = null
    }

    video.onseeked = () => {
      cleanup()
      resolve()
    }
    video.onerror = () => {
      cleanup()
      reject(new Error("seek failed"))
    }

    video.currentTime = time
  })
}

function drawToJpegFile(video: HTMLVideoElement, name: string): File | null {
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return null

  const scale = Math.min(1, MAX_WIDTH / w)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
  if (!dataUrl.startsWith("data:image/jpeg")) return null

  const byteString = atob(dataUrl.split(",")[1])
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
  const base = name.replace(/\.[a-z0-9]+$/i, "") || "video"
  return new File([bytes], `${base}-poster.jpg`, { type: "image/jpeg" })
}

/**
 * Capture one frame as a JPEG File.
 *
 * @param source  local File (always capturable) or remote URL (needs CORS).
 * @param atSeconds optional seek position; defaults to ~10% into the video,
 *                  clamped to [0.5s, 10s] — early frames are often black.
 * @returns a File ready for `uploadMedia`, or null when capture isn't possible.
 */
export async function captureVideoFrame(
  source: VideoFrameSource,
  atSeconds?: number,
): Promise<File | null> {
  if (typeof document === "undefined") return null

  const isFile = source.kind === "file"
  const objectUrl = isFile ? URL.createObjectURL(source.file) : null
  const src = isFile ? objectUrl! : source.url
  const name = isFile ? source.file.name : "video"

  try {
    const video = await loadVideo(src, !isFile)
    try {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      const target =
        atSeconds ??
        Math.min(
          MAX_CAPTURE_SECONDS,
          Math.max(SEEK_FALLBACK_SECONDS, duration * 0.1),
        )
      await seekTo(video, Math.min(target, Math.max(duration - 0.1, 0)))
      return drawToJpegFile(video, name)
    } finally {
      video.removeAttribute("src")
      video.load()
    }
  } catch {
    return null
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}
