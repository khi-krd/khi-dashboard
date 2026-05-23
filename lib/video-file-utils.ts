function guessVideoFormatFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase()
  return ext ?? ""
}

export async function probeVideoFile(file: File): Promise<{
  durationSeconds: number
  fileSizeMb: number
  fileFormat: string
  resolution: string
}> {
  const fileFormat = guessVideoFormatFromName(file.name)
  const fileSizeMb = file.size / (1024 * 1024)
  const url = URL.createObjectURL(file)

  try {
    const { durationSeconds, resolution } = await new Promise<{
      durationSeconds: number
      resolution: string
    }>((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        const d = video.duration
        const w = video.videoWidth
        const h = video.videoHeight
        resolve({
          durationSeconds:
            Number.isFinite(d) && d > 0 ? Math.floor(d) : 0,
          resolution: w > 0 && h > 0 ? `${w}x${h}` : "",
        })
      }
      video.onerror = () => reject(new Error("video metadata load failed"))
      video.src = url
    })
    return { durationSeconds, fileSizeMb, fileFormat, resolution }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function applyVideoFileMeta(file: File): ReturnType<typeof probeVideoFile> {
  return probeVideoFile(file)
}
