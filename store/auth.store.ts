import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserResponse } from "@/types/auth"

interface AuthState {
  token: string | null
  expiresAt: number | null
  user: UserResponse | null
}

interface AuthActions {
  setAuth: (token: string, expiresIn: number) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,

      setAuth: (token, expiresIn) => {
        set({
          token,
          expiresAt: Date.now() + expiresIn,
        })
      },

      setUser: (user) => set({ user }),

      clearAuth: () => set({ token: null, expiresAt: null, user: null }),

      isAuthenticated: () => {
        const { token, expiresAt } = get()
        if (!token || expiresAt === null) return false
        return Date.now() < expiresAt
      },

      isTokenExpired: () => {
        const { expiresAt } = get()
        if (expiresAt === null) return true
        return expiresAt <= Date.now()
      },
    }),
    {
      name: "khi-auth",
      // Only `expiresAt` is persisted — a plain timestamp, harmless if read.
      // The JWT itself stays in memory: persisting it to LocalStorage made it
      // readable by any injected script, and it is redundant anyway. Requests
      // authenticate via the httpOnly `auth_token` cookie, which the proxy at
      // `app/railway-proxy/[[...path]]/route.ts` prefers over any client-sent
      // Authorization header. Keeping `expiresAt` is what lets the session
      // guard still expire the session correctly after a page refresh.
      partialize: (state) => ({
        expiresAt: state.expiresAt,
      }),
    },
  ),
)
