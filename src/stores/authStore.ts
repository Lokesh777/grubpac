import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: (newAccessToken: string) => void;
}

const getStoredRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('refreshToken');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  accessToken: null,
  refreshToken: getStoredRefreshToken(),
  isAuthenticated: !!getStoredRefreshToken(),
  isLoading: true,
  login: (user) => {
    localStorage.setItem('refreshToken', user.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken: user.token, refreshToken: user.refreshToken, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },
  refreshAccessToken: (newAccessToken) => set({ accessToken: newAccessToken }),
}));