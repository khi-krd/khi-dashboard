import { extractApiErrorCode } from "@/lib/api-error"
import api from "@/lib/axios"
import { normalizeSoundReklamVideoDto } from "@/lib/sounds-normalize"
import type { SoundReklamVideoDto } from "@/types/sounds"

const BASE = "/api/v1/sound-tracks/sound-reklam-video"

/**
 * The backend's own keys for this resource. Branch on these rather than on the
 * message, which is translated per request.
 */
export const REKLAM_VIDEO_ALREADY_EXISTS = "sound.reklamVideo.already_exists"
export const REKLAM_VIDEO_NOT_FOUND = "sound.reklamVideo.not_found"

/**
 * "There is no row." Checks the status as well as the key because a `404` from
 * a proxy or a gateway carries no body at all, and for this endpoint an empty
 * `404` means the same thing as the keyed one.
 */
function isMissing(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status
  return status === 404 || extractApiErrorCode(err) === REKLAM_VIDEO_NOT_FOUND
}

function toVideoFormData(file: File): FormData {
  const fd = new FormData()
  fd.append("videoFile", file)
  return fd
}

/**
 * `null` when nothing has been uploaded. The endpoint answers that with a
 * `404` rather than an empty body, and it is the normal state — the site
 * launched without a promo video and editors can remove it at any time — so it
 * is folded into a value here instead of reaching the UI as an error.
 */
export async function getSoundReklamVideo(): Promise<SoundReklamVideoDto | null> {
  try {
    const { data } = await api.get<unknown>(BASE)
    const dto = normalizeSoundReklamVideoDto(data)
    // Keyed off the URL, not the id: the URL is what every consumer needs and
    // is guaranteed present on a `200`, while the id is returned for
    // completeness and is never used — no endpoint here takes one.
    return dto.videoUrl ? dto : null
  } catch (err: unknown) {
    if (isMissing(err)) return null
    throw err
  }
}

/**
 * First upload only. A second `POST` while a row exists fails with
 * `already_exists` — it neither creates a second row nor overwrites the first.
 *
 * That failure is deliberately *not* recovered here. It means another editor
 * uploaded a video while this screen was open, and quietly re-sending the file
 * as a `PATCH` would destroy their upload seconds after they made it. The
 * caller refetches and lets a human decide instead.
 */
export async function createSoundReklamVideo(
  file: File,
): Promise<SoundReklamVideoDto> {
  const { data } = await api.post<unknown>(BASE, toVideoFormData(file))
  return normalizeSoundReklamVideoDto(data)
}

/**
 * Replace the stored file. Despite the verb this is a full replacement — there
 * is no other field to patch — and the backend uploads the new object before
 * deleting the old one, so a failed replace never leaves the site with no
 * promo video.
 */
export async function updateSoundReklamVideo(
  file: File,
): Promise<SoundReklamVideoDto> {
  try {
    const { data } = await api.patch<unknown>(BASE, toVideoFormData(file))
    return normalizeSoundReklamVideoDto(data)
  } catch (err: unknown) {
    // The row was deleted between this screen loading and Replace being
    // pressed. `PATCH` cannot create one, so the same file goes back out as a
    // `POST`. Safe to retry automatically precisely because the slot is empty:
    // there is nothing to overwrite. The mirror-image race is handled the
    // opposite way — see `createSoundReklamVideo`.
    if (isMissing(err)) return await createSoundReklamVideo(file)
    throw err
  }
}

/**
 * `alreadyGone` distinguishes "you removed it" from "it was removed while you
 * were looking at it" — both are successes, but only one is news to the editor.
 */
export async function deleteSoundReklamVideo(): Promise<{
  alreadyGone: boolean
}> {
  try {
    await api.delete(BASE)
    return { alreadyGone: false }
  } catch (err: unknown) {
    // Not idempotent: unlike `DELETE /sound-tracks/{id}`, deleting this twice
    // `404`s the second time. Someone else having already removed it is the
    // outcome the button was asking for, so it settles as success.
    if (isMissing(err)) return { alreadyGone: true }
    throw err
  }
}
