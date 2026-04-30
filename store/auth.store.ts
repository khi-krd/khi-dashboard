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
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
      }),
    },
  ),
)
