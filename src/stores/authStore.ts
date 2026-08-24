import { create } from 'zustand';
import type { User } from '@/types';
import { setAccessToken, setRefreshToken } from '@/api/client';
import { clearSession, saveSession } from '@/api/tokenStorage';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  rememberMe: false,

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
