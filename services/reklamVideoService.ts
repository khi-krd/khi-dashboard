import { extractApiErrorCode } from "@/lib/api-error"
import api from "@/lib/axios"
import type { ReklamVideoConfig } from "@/lib/reklam-video"
import { normalizeReklamVideoDto } from "@/lib/reklam-video-normalize"
import type { ReklamVideoDto } from "@/types/reklam-video"

/**
 * "There is no row." Checks the status as well as the key, because a `404`
 * from a proxy or gateway carries no body at all and for these endpoints an
 * empty `404` means the same thing as the keyed one.
 */
function isMissing(config: ReklamVideoConfig, err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status
  return status === 404 || extractApiErrorCode(err) === config.notFoundKey
}

export function isReklamVideoConflict(
  config: ReklamVideoConfig,
  err: unknown,
): boolean {
  return extractApiErrorCode(err) === config.alreadyExistsKey
}

function toVideoFormData(file: File): FormData {
  const fd = new FormData()
  fd.append("videoFile", file)
  return fd
}

/**
 * `null` when nothing has been uploaded. Both endpoints answer that with a
 * `404` rather than an empty body, and it is the normal state — each section
 * shipped without a video and editors can remove one at any time — so it is
 * folded into a value here instead of reaching the UI as an error.
 */
export async function getReklamVideo(
  config: ReklamVideoConfig,
): Promise<ReklamVideoDto | null> {
  try {
    const { data } = await api.get<unknown>(config.basePath)
    const dto = normalizeReklamVideoDto(data)
    // Keyed off the URL, not the id: the URL is what every consumer needs and
    // is guaranteed present on a `200`, while the id is returned for
    // completeness and never used — no endpoint here takes one.
    return dto.videoUrl ? dto : null
  } catch (err: unknown) {
    if (isMissing(config, err)) return null
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
export async function createReklamVideo(
  config: ReklamVideoConfig,
  file: File,
): Promise<ReklamVideoDto> {
  const { data } = await api.post<unknown>(
    config.basePath,
    toVideoFormData(file),
  )
  return normalizeReklamVideoDto(data)
}

/**
 * Replace the stored file. Despite the verb this is a full replacement — there
 * is no other field to patch — and the backend uploads the new object before
 * deleting the old one, so a failed replace never leaves the section without a
 * video.
 */
export async function updateReklamVideo(
  config: ReklamVideoConfig,
  file: File,
): Promise<ReklamVideoDto> {
  try {
    const { data } = await api.patch<unknown>(
      config.basePath,
      toVideoFormData(file),
    )
    return normalizeReklamVideoDto(data)
  } catch (err: unknown) {
    // The row was deleted between this screen loading and Replace being
    // pressed. `PATCH` cannot create one, so the same file goes back out as a
    // `POST`. Safe to retry automatically precisely because the slot is empty:
    // there is nothing to overwrite. The mirror-image race is handled the
    // opposite way — see `createReklamVideo`.
    if (isMissing(config, err)) return await createReklamVideo(config, file)
    throw err
  }
}

/**
 * `alreadyGone` distinguishes "you removed it" from "it was removed while you
 * were looking at it" — both are successes, but only one is news to the editor.
 */
export async function deleteReklamVideo(
  config: ReklamVideoConfig,
): Promise<{ alreadyGone: boolean }> {
  try {
    await api.delete(config.basePath)
    return { alreadyGone: false }
  } catch (err: unknown) {
    // Not idempotent: unlike the per-id deletes elsewhere in the API, deleting
    // this twice `404`s the second time. Someone else having already removed
    // it is the outcome the button was asking for, so it settles as success.
    if (isMissing(config, err)) return { alreadyGone: true }
    throw err
  }
}
