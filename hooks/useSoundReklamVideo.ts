"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { soundKeys } from "@/lib/sounds-query-keys"
import {
  createSoundReklamVideo,
  deleteSoundReklamVideo,
  getSoundReklamVideo,
  updateSoundReklamVideo,
} from "@/services/soundReklamVideoService"
import type { SoundReklamVideoDto } from "@/types/sounds"

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
