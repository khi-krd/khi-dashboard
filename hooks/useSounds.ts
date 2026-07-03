"use client"

import {
  useMutation,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { soundKeys } from "@/lib/sounds-query-keys"
import { syncFeaturedSoundsCache } from "@/lib/featured-cache-sync"
import {
  createSound,
  createTopic,
  deleteSound,
  deleteTopic,
  getAlbumOfMemories,
  getSoundById,
  getSoundsByState,
  getSoundsByTopic,
  getSoundsByType,
  getSoundsList,
  getTopics,
  patchSoundFeatured,
  searchSounds,
  updateSound,
} from "@/services/soundsService"
import type {
  FeaturedPayload,
  NewTopicPayload,
  SoundDto,
  SoundPage,
} from "@/types/sounds"
import type { SoundsListQueryKeyParts } from "@/types/sounds-ui"

async function fetchSoundsPage(
  params: SoundsListQueryKeyParts,
): Promise<SoundPage> {
  const kw = params.keyword.trim()

  if (kw.length >= 1) {
    return searchSounds(kw, params.page, params.size)
  }

  if (params.stateFilter === "album_of_memories") {
    return getAlbumOfMemories(params.page, params.size)
  }

  if (params.stateFilter === "single") {
    return getSoundsByState("SINGLE", params.page, params.size)
  }

  if (params.stateFilter === "multi") {
    return getSoundsByState("MULTI", params.page, params.size)
  }

  if (params.typeFilter) {
    return getSoundsByType(params.typeFilter, params.page, params.size)
  }

  if (params.topicId != null) {
    return getSoundsByTopic(params.topicId, params.page, params.size)
  }

  return getSoundsList(params.page, params.size)
}

export function useSoundsListQuery(params: SoundsListQueryKeyParts) {
  return useQuery({
    queryKey: soundKeys.list(params),
    queryFn: () => fetchSoundsPage(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

async function resolveSoundDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<SoundDto | null> {
  const cached = queryClient.getQueryData<SoundDto>(soundKeys.detail(id))
  if (cached?.id) return cached

  const fromApi = await getSoundById(id)
  if (fromApi) return fromApi

  const listQueries = queryClient.getQueriesData<SoundPage>({
    queryKey: soundKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((s) => s.id === id)
    if (hit) return hit
  }

  const page = await getSoundsList(0, 500)
  return page.content.find((s) => s.id === id) ?? null
}

export function useSoundDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: soundKeys.detail(id),
    queryFn: () => resolveSoundDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSoundTopicsQuery() {
  return useQuery({
    queryKey: soundKeys.topics(),
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NewTopicPayload) => createTopic(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: soundKeys.topics() })
    },
  })
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: number) => deleteTopic(topicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: soundKeys.topics() })
      void queryClient.invalidateQueries({ queryKey: soundKeys.lists() })
    },
  })
}

export function useCreateSound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createSound(formData),
    onSuccess: (data) => {
      if (data.id) {
        queryClient.setQueryData(soundKeys.detail(data.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: soundKeys.lists() })
    },
  })
}

export function useUpdateSound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; formData: FormData }) =>
      updateSound(variables.id, variables.formData),
    onSuccess: (data, variables) => {
      if (data.id) {
        queryClient.setQueryData(soundKeys.detail(variables.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: soundKeys.lists() })
    },
  })
}

export function useDeleteSoundMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSound(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: soundKeys.lists() })
      const snapshots = queryClient.getQueriesData<SoundPage>({
        queryKey: soundKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.filter((s) => s.id !== id),
          totalElements: Math.max(0, (data.totalElements ?? 1) - 1),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: soundKeys.lists() })
      void queryClient.removeQueries({ queryKey: soundKeys.detail(id) })
    },
  })
}

export function usePatchSoundFeaturedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; payload: FeaturedPayload }) =>
      patchSoundFeatured(variables.id, variables.payload),
    onSuccess: (_, { id, payload }) => {
      const featured = payload.featured !== false
      const featuredOrder = featured ? (payload.featuredOrder ?? null) : null

      queryClient.setQueryData<SoundDto | undefined>(
        soundKeys.detail(id),
        (prev) =>
          prev
            ? { ...prev, featured, featuredOrder }
            : prev,
      )

      const listQueries = queryClient.getQueriesData<SoundPage>({
        queryKey: soundKeys.lists(),
      })
      for (const [key, data] of listQueries) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.map((s) =>
            s.id === id ? { ...s, featured, featuredOrder } : s,
          ),
        })
      }
      syncFeaturedSoundsCache(queryClient, id, featured, featuredOrder)
      void queryClient.invalidateQueries({ queryKey: ["featured-catalog"] })
    },
  })
}
