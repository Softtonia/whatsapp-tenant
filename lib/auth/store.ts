import { create } from "zustand";
import { setAuthTokenGetter, setUnauthorizedHandler } from "@/src/lib/api/client";
import type { AuthStore, MfaChallenge } from "./types";
import type { User } from "@/types/user";

export const useAuthStore = create<AuthStore>((set, get) => ({
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
}));

// Wire up API Client token resolver and 401 handler
setAuthTokenGetter(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => {
  useAuthStore.getState().setSessionExpired(true);
});
