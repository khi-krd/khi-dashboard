import api from "@/lib/axios"
import { normalizeSoundReklamVideoDto } from "@/lib/sounds-normalize"
import type { SoundReklamVideoDto } from "@/types/sounds"

const BASE = "/api/v1/sound-tracks/sound-reklam-video"

function toVideoFormData(file: File): FormData {
  const fd = new FormData()
  fd.append("videoFile", file)
  return fd
}

export async function getSoundReklamVideo(): Promise<SoundReklamVideoDto | null> {
  try {
    const { data } = await api.get<unknown>(BASE)
    const dto = normalizeSoundReklamVideoDto(data)
    return dto.id ? dto : null
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function createSoundReklamVideo(
  file: File,
): Promise<SoundReklamVideoDto> {
  const { data } = await api.post<unknown>(BASE, toVideoFormData(file))
  return normalizeSoundReklamVideoDto(data)
}

export async function updateSoundReklamVideo(
  file: File,
): Promise<SoundReklamVideoDto> {
  const { data } = await api.patch<unknown>(BASE, toVideoFormData(file))
  return normalizeSoundReklamVideoDto(data)
}

export async function deleteSoundReklamVideo(): Promise<void> {
  await api.delete(BASE)
}
