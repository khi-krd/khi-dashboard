"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { videoKeys } from "@/lib/videos-query-keys"
import {
  createTopic,
  createVideo,
  deleteTopic,
  deleteVideo,
  getTopics,
  getVideoById,
  getVideosList,
  searchVideosByKeyword,
  searchVideosByTag,
  updateVideo,
} from "@/services/videosService"
import type { NewTopicPayload, VideoDto, VideoPage } from "@/types/videos"
import type { VideosListQueryKeyParts } from "@/types/videos-ui"

async function fetchVideosPage(
  params: VideosListQueryKeyParts,
): Promise<VideoPage> {
  const kw = params.keyword.trim()
  if (kw.length >= 2) {
    if (params.searchMode === "keyword" || kw.startsWith("#")) {
      const value = kw.startsWith("#") ? kw.slice(1) : kw
      return searchVideosByKeyword(value, params.page, params.size)
    }
    if (params.searchMode === "tag") {
      return searchVideosByTag(kw, params.page, params.size)
    }
    try {
      const byTag = await searchVideosByTag(kw, params.page, params.size)
      if ((byTag.content?.length ?? 0) > 0) return byTag
    } catch {
      /* fall through */
    }
    return searchVideosByKeyword(kw, params.page, params.size)
  }
  return getVideosList(params.page, params.size)
}

export function useVideosListQuery(params: VideosListQueryKeyParts) {
  return useQuery({
    queryKey: videoKeys.list(params),
    queryFn: () => fetchVideosPage(params),
    staleTime: 1000 * 60 * 2,
  })
}

async function resolveVideoDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<VideoDto | null> {
  const cached = queryClient.getQueryData<VideoDto>(videoKeys.detail(id))
  if (cached?.id) return cached

  const fromApi = await getVideoById(id)
  if (fromApi) return fromApi

  const listQueries = queryClient.getQueriesData<VideoPage>({
    queryKey: videoKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((v) => v.id === id)
    if (hit) return hit
  }

  const page = await getVideosList(0, 500)
  return page.content.find((v) => v.id === id) ?? null
}

export function useVideoDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => resolveVideoDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useVideoTopicsQuery() {
  return useQuery({
    queryKey: videoKeys.topics(),
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createVideo(formData),
    onSuccess: (data) => {
      if (data.id) {
        queryClient.setQueryData(videoKeys.detail(data.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; formData: FormData }) =>
      updateVideo(variables.id, variables.formData),
    onSuccess: (data, variables) => {
      if (data.id) {
        queryClient.setQueryData(videoKeys.detail(variables.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}

export function useDeleteVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteVideo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: videoKeys.lists() })
      const snapshots = queryClient.getQueriesData<VideoPage>({
        queryKey: videoKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.filter((v) => v.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
      void queryClient.removeQueries({ queryKey: videoKeys.detail(id) })
    },
  })
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NewTopicPayload) => createTopic(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: videoKeys.topics() })
    },
  })
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: number) => deleteTopic(topicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: videoKeys.topics() })
      void queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}
