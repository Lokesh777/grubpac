import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { refreshUserToken } from '@/api/auth';
import { setAccessToken, setRefreshToken } from '@/api/client';
import { loadSession, clearSession } from '@/api/tokenStorage';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const BoardPage = lazy(() => import('@/pages/BoardPage').then((m) => ({ default: m.BoardPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

function ThemeEffect() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

function SessionInit() {
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const stored = loadSession();
      if (!stored?.refreshToken) {
        setLoading(false);
        return;
      }

      try {
        setRefreshToken(stored.refreshToken);
        const data = await refreshUserToken(stored.refreshToken);
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        useAuthStore.getState().restoreSession(
          {
            ...stored.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          },
          stored.rememberMe,
        );
      } catch {
        clearSession();
        if (!cancelled) useAuthStore.getState().logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [setLoading]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeEffect />
        <SessionInit />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
