"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { extractApiErrorCode } from "@/lib/api-error"
import { soundKeys } from "@/lib/sounds-query-keys"
import {
  createSoundReklamVideo,
  deleteSoundReklamVideo,
  getSoundReklamVideo,
  REKLAM_VIDEO_ALREADY_EXISTS,
  updateSoundReklamVideo,
} from "@/services/soundReklamVideoService"
import type { SoundReklamVideoDto } from "@/types/sounds"

/** True when this upload lost the race to another editor's. */
export function isReklamVideoConflict(error: unknown): boolean {
  return extractApiErrorCode(error) === REKLAM_VIDEO_ALREADY_EXISTS
}

export function useSoundReklamVideoQuery() {
  return useQuery({
    queryKey: soundKeys.reklamVideo(),
    queryFn: getSoundReklamVideo,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSoundReklamVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => createSoundReklamVideo(file),
    onSuccess: (data) => {
      queryClient.setQueryData<SoundReklamVideoDto>(soundKeys.reklamVideo(), data)
    },
    onError: (error) => {
      // Another editor uploaded one while this screen sat open. Pull in the row
      // they created so the screen swaps Upload for Replace on its own —
      // otherwise it keeps offering an Upload button that can only ever fail
      // the same way again.
      if (isReklamVideoConflict(error)) {
        void queryClient.invalidateQueries({
          queryKey: soundKeys.reklamVideo(),
        })
      }
    },
  })
}

export function useUpdateSoundReklamVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => updateSoundReklamVideo(file),
    onSuccess: (data) => {
      queryClient.setQueryData<SoundReklamVideoDto>(soundKeys.reklamVideo(), data)
    },
  })
}

export function useDeleteSoundReklamVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSoundReklamVideo(),
    onSuccess: () => {
      queryClient.setQueryData<SoundReklamVideoDto | null>(
        soundKeys.reklamVideo(),
        null,
      )
    },
  })
}
