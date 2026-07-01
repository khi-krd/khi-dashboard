"use client"

import {
  useMutation,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { writingsKeys } from "@/lib/writings-query-keys"
import { syncFeaturedWritingsCache } from "@/lib/featured-cache-sync"
import {
  createWriting,
  deleteWriting,
  getSeriesById,
  getSeriesParents,
  getTopics,
  getWritingById,
  getWritingsList,
  linkToSeries,
  patchWritingFeatured,
  searchWritingsByKeyword,
  searchWritingsByTag,
  searchWritingsByWriter,
  updateWriting,
} from "@/services/writingsService"
import type {
  FeaturedPayload,
  LinkSeriesPayload,
  WritingDto,
  WritingPage,
} from "@/types/writings"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

async function fetchWritingsPage(
  params: WritingsListQueryKeyParts,
): Promise<WritingPage> {
  const kw = params.keyword.trim()

  if (kw.length >= 1) {
    if (params.searchMode === "tag") {
      return searchWritingsByTag(kw, params.page, params.size)
    }
    if (params.searchMode === "keyword") {
      return searchWritingsByKeyword(kw, params.page, params.size)
    }
    return searchWritingsByWriter(kw, params.page, params.size)
  }

  if (params.topicId != null) {
    const page = await getWritingsList(params.page, params.size)
    return {
      ...page,
      content: page.content.filter((w) => w.topicId === params.topicId),
    }
  }

  return getWritingsList(params.page, params.size)
}

export function useWritingsListQuery(params: WritingsListQueryKeyParts) {
  return useQuery({
    queryKey: writingsKeys.list(params),
    queryFn: () => fetchWritingsPage(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

async function resolveWritingDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<WritingDto | null> {
  const cached = queryClient.getQueryData<WritingDto>(writingsKeys.detail(id))
  if (cached?.id) return cached

  const fromApi = await getWritingById(id)
  if (fromApi) return fromApi

  const listQueries = queryClient.getQueriesData<WritingPage>({
    queryKey: writingsKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((w) => w.id === id)
    if (hit) return hit
  }

  const page = await getWritingsList(0, 500)
  return page.content.find((w) => w.id === id) ?? null
}

export function useWritingDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: writingsKeys.detail(id),
    queryFn: () => resolveWritingDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useWritingTopicsQuery() {
  return useQuery({
    queryKey: writingsKeys.topics(),
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSeriesParentsQuery() {
  return useQuery({
    queryKey: writingsKeys.seriesParents(),
    queryFn: () => getSeriesParents(0, 100),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSeriesDetailQuery(seriesId: string) {
  return useQuery({
    queryKey: writingsKeys.series(seriesId),
    queryFn: () => getSeriesById(seriesId),
    enabled: !!seriesId?.trim(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateWriting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createWriting(formData),
    onSuccess: (data) => {
      if (data.id) {
        queryClient.setQueryData(writingsKeys.detail(data.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: writingsKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: writingsKeys.seriesParents(),
      })
    },
  })
}

export function useUpdateWriting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; formData: FormData }) =>
      updateWriting(variables.id, variables.formData),
    onSuccess: (data, variables) => {
      if (data.id) {
        queryClient.setQueryData(writingsKeys.detail(variables.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: writingsKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: writingsKeys.seriesParents(),
      })
    },
  })
}

export function useDeleteWritingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteWriting(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: writingsKeys.lists() })
      const snapshots = queryClient.getQueriesData<WritingPage>({
        queryKey: writingsKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.filter((w) => w.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: writingsKeys.lists() })
      void queryClient.removeQueries({ queryKey: writingsKeys.detail(id) })
    },
  })
}

export function useLinkToSeriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LinkSeriesPayload) => linkToSeries(payload),
    onSuccess: (data) => {
      if (data.id) {
        queryClient.setQueryData(writingsKeys.detail(data.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: writingsKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: writingsKeys.seriesParents(),
      })
    },
  })
}

export function usePatchWritingFeaturedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; payload: FeaturedPayload }) =>
      patchWritingFeatured(variables.id, variables.payload),
    onSuccess: (_, { id, payload }) => {
      const featured = payload.featured !== false
      const featuredOrder = featured ? (payload.featuredOrder ?? null) : null

      queryClient.setQueryData<WritingDto | undefined>(
        writingsKeys.detail(id),
        (prev) =>
          prev
            ? { ...prev, featured, featuredOrder }
            : prev,
      )

      const listQueries = queryClient.getQueriesData<WritingPage>({
        queryKey: writingsKeys.lists(),
      })
      for (const [key, data] of listQueries) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.map((w) =>
            w.id === id ? { ...w, featured, featuredOrder } : w,
          ),
        })
      }
      syncFeaturedWritingsCache(queryClient, id, featured, featuredOrder)
      void queryClient.invalidateQueries({ queryKey: ["featured-catalog"] })
    },
  })
}
