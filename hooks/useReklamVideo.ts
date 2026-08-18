"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ReklamVideoConfig } from "@/lib/reklam-video"
import {
  createReklamVideo,
  deleteReklamVideo,
  getReklamVideo,
  isReklamVideoConflict,
  updateReklamVideo,
} from "@/services/reklamVideoService"
import type { ReklamVideoDto } from "@/types/reklam-video"

export function useReklamVideoQuery(config: ReklamVideoConfig) {
  return useQuery({
    queryKey: config.queryKey,
    queryFn: () => getReklamVideo(config),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateReklamVideoMutation(config: ReklamVideoConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => createReklamVideo(config, file),
    onSuccess: (data) => {
      queryClient.setQueryData<ReklamVideoDto>(config.queryKey, data)
    },
    onError: (error) => {
      // Another editor uploaded one while this screen sat open. Pull in the row
      // they created so the screen swaps Upload for Replace on its own —
      // otherwise it keeps offering an Upload button that can only ever fail
      // the same way again.
      if (isReklamVideoConflict(config, error)) {
        void queryClient.invalidateQueries({ queryKey: config.queryKey })
      }
    },
  })
}

export function useUpdateReklamVideoMutation(config: ReklamVideoConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => updateReklamVideo(config, file),
    onSuccess: (data) => {
      queryClient.setQueryData<ReklamVideoDto>(config.queryKey, data)
    },
  })
}

export function useDeleteReklamVideoMutation(config: ReklamVideoConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteReklamVideo(config),
    onSuccess: () => {
      queryClient.setQueryData<ReklamVideoDto | null>(config.queryKey, null)
    },
  })
}
