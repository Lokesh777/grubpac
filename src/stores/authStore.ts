import { create } from 'zustand';
import type { User } from '@/types';
import { setAccessToken, setRefreshToken } from '@/api/client';
import { clearSession, loadSession, saveSession } from '@/api/tokenStorage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  login: (user: User, rememberMe?: boolean) => void;
  restoreSession: (user: User, rememberMe: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

function readStoredAuth(): Pick<
  AuthState,
  'user' | 'accessToken' | 'refreshToken' | 'isAuthenticated' | 'isLoading' | 'rememberMe'
> {
  const empty = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    rememberMe: false,
  };
  if (typeof window === 'undefined') return empty;

  const stored = loadSession();
  if (!stored?.refreshToken) return empty;

  setRefreshToken(stored.refreshToken);
  const user = {
    ...stored.user,
    token: '',
    refreshToken: stored.refreshToken,
  } as User;

  return {
    user,
    accessToken: null,
    refreshToken: stored.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    rememberMe: stored.rememberMe,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...readStoredAuth(),

  login: (user, rememberMe = false) => {
    setAccessToken(user.token);
    setRefreshToken(user.refreshToken);
    saveSession(user, user.refreshToken, rememberMe);
    set({
      user,
      accessToken: user.token,
      refreshToken: user.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      rememberMe,
    });
  },

  restoreSession: (user, rememberMe) => {
    get().login(user, rememberMe);
  },

  logout: () => {
    setAccessToken(null);
    setRefreshToken(null);
    clearSession();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
