import { create } from 'zustand';
import type { User } from '@/types';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredSession {
  user: User;
  savedAt: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, rememberMe?: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: (newAccessToken: string) => void;
}

function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (Date.now() - session.savedAt > THIRTY_DAYS_MS) {
      localStorage.removeItem('session');
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem('session');
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = getStoredSession();

  return {
    user: stored?.user ?? null,
    accessToken: null,
    refreshToken: stored?.user?.refreshToken ?? null,
    isAuthenticated: !!stored?.user?.refreshToken,
    isLoading: true,

    login: (user, rememberMe = false) => {
      if (rememberMe) {
        const session: StoredSession = { user, savedAt: Date.now() };
        localStorage.setItem('session', JSON.stringify(session));
      } else {
        localStorage.removeItem('session');
      }
      set({
        user,
        accessToken: user.token,
        refreshToken: user.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    logout: () => {
      localStorage.removeItem('session');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setTokens: (accessToken, refreshToken) => {
      const stored = getStoredSession();
      if (stored) {
        const updated: StoredSession = {
          user: { ...stored.user, refreshToken },
          savedAt: stored.savedAt,
        };
        localStorage.setItem('session', JSON.stringify(updated));
      }
      set({ accessToken, refreshToken });
    },

    refreshAccessToken: (newAccessToken) => set({ accessToken: newAccessToken }),
  };
});
