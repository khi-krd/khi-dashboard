"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createNews,
  deleteNews,
  getNewsById,
  getNewsList,
  searchNews,
  updateNews,
} from "@/src/services/newsService"

export function useNewsList(page: number, size: number) {
  return useQuery({
    queryKey: ["news", "list", page, size],
    queryFn: () => getNewsList(page, size),
    staleTime: 1000 * 60 * 2,
  })
}

export function useNewsById(id: number) {
  return useQuery({
    queryKey: ["news", id],
    queryFn: () => getNewsById(id),
    enabled: Boolean(id),
  })
}

export function useSearchNews(query: string, page: number, size: number) {
  return useQuery({
    queryKey: ["news", "search", query, page, size],
    queryFn: () => searchNews(query, page, size),
    enabled: query.trim().length > 0,
  })
}

export function useCreateNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createNews(formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; formData: FormData }) =>
      updateNews(variables.id, variables.formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useDeleteNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNews(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}
