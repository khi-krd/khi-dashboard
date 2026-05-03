"use client"

import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes — data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes — cache kept in memory
      retry: 1, // retry once on failure
      refetchOnWindowFocus: false, // admin panel — no aggressive refetching
    },
    mutations: {
      retry: 0, // never retry mutations
    },
  },
})
