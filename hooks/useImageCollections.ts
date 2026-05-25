"use client"

import {
  useMutation,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { submitCollection } from "@/lib/image-collections-form-data"
import { collectionKeys } from "@/lib/image-collections-query-keys"
import type { CollectionFormValues } from "@/lib/validations/image-collections"
import {
  createTopic,
  deleteCollection,
  deleteTopic,
  getCollectionById,
  getCollectionsList,
  getTopics,
} from "@/services/imageCollectionsService"
import type {
  CollectionDto,
  CollectionPage,
  NewTopicPayload,
} from "@/types/image-collections"
import type { CollectionsListQueryKeyParts } from "@/types/image-collections-ui"

async function fetchCollectionsPage(
  params: CollectionsListQueryKeyParts,
): Promise<CollectionPage> {
  const typeParam =
    params.typeFilter !== "all" ? params.typeFilter : undefined
  return getCollectionsList(params.page, params.size, {
    type: typeParam,
    topicId: params.topicId ?? undefined,
  })
}

export function useCollectionsListQuery(params: CollectionsListQueryKeyParts) {
  return useQuery({
    queryKey: collectionKeys.list(params),
    queryFn: () => fetchCollectionsPage(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

async function resolveCollectionDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<CollectionDto | null> {
  const cached = queryClient.getQueryData<CollectionDto>(collectionKeys.detail(id))
  if (cached?.id) return cached

  const fromApi = await getCollectionById(id)
  if (fromApi) return fromApi

  const listQueries = queryClient.getQueriesData<CollectionPage>({
    queryKey: collectionKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((c) => c.id === id)
    if (hit) return hit
  }

  const page = await getCollectionsList(0, 500)
  return page.content.find((c) => c.id === id) ?? null
}

export function useCollectionDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => resolveCollectionDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCollectionTopicsQuery() {
  return useQuery({
    queryKey: collectionKeys.topics(),
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CollectionFormValues) =>
      submitCollection("create", undefined, values),
    onSuccess: (data) => {
      if (data.id) {
        queryClient.setQueryData(collectionKeys.detail(data.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; values: CollectionFormValues }) =>
      submitCollection("edit", variables.id, variables.values),
    onSuccess: (data, variables) => {
      if (data.id) {
        queryClient.setQueryData(collectionKeys.detail(variables.id), data)
      }
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
  })
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.lists() })
      const snapshots = queryClient.getQueriesData<CollectionPage>({
        queryKey: collectionKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          content: data.content.filter((c) => c.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
      void queryClient.removeQueries({ queryKey: collectionKeys.detail(id) })
    },
  })
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NewTopicPayload) => createTopic(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collectionKeys.topics() })
    },
  })
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: number) => deleteTopic(topicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collectionKeys.topics() })
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
  })
}
