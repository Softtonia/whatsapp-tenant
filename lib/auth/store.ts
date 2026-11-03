import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setAuthTokenGetter, setUnauthorizedHandler } from "@/src/lib/api/client";
import type { AuthStore, MfaChallenge } from "./types";
import type { User } from "@/types/user";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isSessionExpired: false,
      mfaChallenge: null,

      setCredentials: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          isSessionExpired: false,
          mfaChallenge: null,
        });
      },

      updateUser: (partialUser: Partial<User>) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partialUser } });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isSessionExpired: false,
          mfaChallenge: null,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setSessionExpired: (isSessionExpired: boolean) => {
        set({ isSessionExpired, token: null, isAuthenticated: false });
      },

      setMfaChallenge: (mfaChallenge: MfaChallenge | null) => {
        set({ mfaChallenge });
      },
    }),
    {
      name: "whatsapp-auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as any)
      ),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Wire up API Client token resolver and 401 handler
setAuthTokenGetter(() => {
  const token = useAuthStore.getState().token;
  if (token) return token;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("whatsapp-auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.state?.token || null;
      }
    } catch {
      // ignore
    }
  }
  return null;
});

setUnauthorizedHandler(() => {
  useAuthStore.getState().setSessionExpired(true);
});
