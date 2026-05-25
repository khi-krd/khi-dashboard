"use client"

import {
  useMutation,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { NewsWritePayload } from "@/lib/news-form-data"
import {
  bulkDeleteNews,
  createNews,
  deleteNews,
  getNewsById,
  getNewsList,
  searchNews,
  updateNews,
} from "@/services/newsService"
import { newsKeys } from "@/lib/news-query-keys"
import type { NewsListQueryKeyParts } from "@/types/news-ui"

function fetchNewsPage(params: NewsListQueryKeyParts) {
  const kw = params.keyword.trim()
  if (kw.length >= 2) {
    return searchNews(kw, params.page, params.size)
  }
  return getNewsList(params.page, params.size)
}

export function useNewsListQuery(params: NewsListQueryKeyParts) {
  return useQuery({
    queryKey: newsKeys.list(params),
    queryFn: () => fetchNewsPage(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

export function useNewsDetailQuery(id: number) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => getNewsById(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NewsWritePayload) => createNews(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
    },
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; payload: NewsWritePayload }) =>
      updateNews(variables.id, variables.payload),
    onSuccess: (res, variables) => {
      if (res.success && res.data?.id === variables.id) {
        queryClient.setQueryData(newsKeys.detail(variables.id), res)
      }
      void queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
    },
  })
}

export function useDeleteNewsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNews(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
      void queryClient.removeQueries({ queryKey: newsKeys.detail(id) })
    },
  })
}

export function useBulkDeleteNewsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => bulkDeleteNews(ids),
    onSuccess: (_void, ids) => {
      void queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
      for (const id of ids) {
        void queryClient.removeQueries({ queryKey: newsKeys.detail(id) })
      }
    },
  })
}
