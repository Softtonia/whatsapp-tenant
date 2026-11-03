import type { User } from "@/types/user";

export interface MfaChallenge {
  challengeToken: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  mfaChallenge: MfaChallenge | null;
}

export interface AuthActions {
  setCredentials: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setSessionExpired: (isExpired: boolean) => void;
  setMfaChallenge: (challenge: MfaChallenge | null) => void;
}

export type AuthStore = AuthState & AuthActions;
